import EventEmitter from "node:events";

import type { GameSession } from "@/GameSession/types";
import type { Player } from "@/Player/Player";
import type { WordClientAction, WordOptionsClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";
import type { TurnResultObj, TurnResultStatePayload } from "@/types/game-state";
import type { TurnPlayerScoreObj, TurnScoreObj } from "@/types/player";
import { Word } from "@/Word/Word";

import type { Game } from "./Game";
import { Result } from "./GameStates/Result";
import { getRandomElement } from "./utils";

type Events = {
    TURN_START: [Turn];
    TURN_END: [Turn];
    WORD_SEL_START: [Turn];
    WORD_SEL_END: [Turn];
    DRAW_START: [];
    DRAW_END: [];
    HAS_GUESSED: [Player];
    RESULT_START: [];
    RESULT_END: [];
};

type onType = EventEmitter<Events>["on"];
type emitType = EventEmitter<Events>["emit"];

function playersArrToTurnScoreObj(players: Player[]) {
    return players.reduce<TurnScoreObj>(
        (obj, p) => ({
            ...obj,
            [p.id]: {
                player: p,
                deltaPoints: 0,
                tries: 0,
            },
        }),
        {},
    );
}

export class Turn extends EventEmitter<Events> {
    private game!: Game;
    private session!: GameSession;
    private players!: Set<Player>;
    private artist!: Player;

    guessWordsSelectionList!: string[];
    guessWord!: string;
    gPlayers: Set<Player> = new Set();
    guessCounter: number = 0;
    scoresObj: TurnScoreObj = {};
    resultObj: TurnResultObj[] = [];
    wordAPI!: Word;

    constructor(artist: Player, session: GameSession, game: Game, players: Set<Player>) {
        super();

        this.game = game;
        this.artist = artist;
        this.players = players;
        this.session = session;
        this.scoresObj = playersArrToTurnScoreObj([...this.players]);
        this.setup();
    }

    setup(): void {
        const game = this.game;
        const clk = game.clock;
        const wordSelDurr = 20;
        game.state.setTurn.call(game.state, this);
        const moveToNextState = () => {
            game.changeState.call(game, game.state.nextState.call(game.state));
        };

        this.ON("TURN_START", (e) => {
            this.guessWordsSelectionList = this.pickGuessWords(3, false);
            console.log("Turn has started..", this.guessWordsSelectionList);
            this.artist.isArtist = true;
            e.artist.sendMsg({
                type: ClientActionTypes.WORD_OPTIONS,
                payload: {
                    words: this.guessWordsSelectionList,
                },
            } as WordOptionsClientAction);
            this.EMIT("WORD_SEL_START", this);
        });

        this.ON("WORD_SEL_START", (turn) => {
            moveToNextState();
            const removeWordSelListener = clk.onTick(
                (tick: number) => {
                    const timer_value = wordSelDurr - tick;
                    this.session.broadcastMessageToAllPlayers({
                        type: ClientActionTypes.CLOCK_UPDATE,
                        payload: { value: timer_value },
                    });
                },
                [
                    (tick: number) => {
                        // select a word at random if the artist fails to select one
                        if (!this.guessWord) {
                            this.guessWord = getRandomElement(this.guessWordsSelectionList);
                        }
                        this.EMIT("WORD_SEL_END", this);
                    },
                    wordSelDurr,
                ],
            );

            this.artist.on("WORD_SELECTED", ({ word }) => {
                // validate the word
                if (!this.guessWordsSelectionList.includes(word)) {
                    throw new Error("Something weird detected while word selection");
                }
                this.guessWord = word;
                // initiate draw_start
                removeWordSelListener();
                this.EMIT("WORD_SEL_END", this);
            });

            clk.startClock();
        });

        this.ON("WORD_SEL_END", (turn) => {
            console.log("Word Select ended", this.guessWord);
            this.wordAPI = new Word(this.guessWord);

            this.wordAPI.broadcastWordUpdate(this.session);
            this.artist.sendMsg({
                type: ClientActionTypes.WORD,
                payload: {
                    word: Object.values(this.wordAPI.wordObj),
                },
            } as WordClientAction);

            // cleanup after word select
            this.artist.removeAllListeners("WORD_SELECTED");
            this.EMIT("DRAW_START");
        });

        const drawDurr = this.game.config.turnDuration;
        this.ON("DRAW_START", () => {
            moveToNextState();
            const removeDrawTimer = clk.onTick(
                (tick: number) => {
                    const timer_value = drawDurr - tick;
                    this.session.broadcastMessageToAllPlayers({
                        type: ClientActionTypes.CLOCK_UPDATE,
                        payload: { value: timer_value },
                    });
                },
                [
                    (tick: number) => {
                        this.EMIT("DRAW_END");
                    },
                    drawDurr,
                ],
            );
            clk.startClock();
            this.ON("HAS_GUESSED", (player) => {
                this.guessCounter++;
                this.calculateGuesserScore(player);
                if (this.gPlayers.size == this.session.players.size - 1) {
                    removeDrawTimer();
                    this.EMIT("DRAW_END");
                }
            });
        });

        this.ON("DRAW_END", () => {
            this.calculateArtistScore(this.artist);
            this.EMIT("RESULT_START");
        });

        const resultDurr = 10;
        this.ON("RESULT_START", () => {
            const resultState = new Result(game, this);
            // set result on payload
            resultState.altPayload = {
                state: resultState.state,
                result: this.getTurnResult(),
            } as TurnResultStatePayload;

            this.game.changeState(resultState);
            this.updatePlayerScores();

            const removeResultScreenTimer = clk.onTick(
                (tick: number) => {
                    const timer_value = resultDurr - tick;
                    this.session.broadcastMessageToAllPlayers({
                        type: ClientActionTypes.CLOCK_UPDATE,
                        payload: { value: timer_value },
                    });
                },
                [
                    (tick: number) => {
                        this.EMIT("TURN_END", this);
                    },
                    resultDurr,
                ],
            );
            clk.startClock();
        });

        this.ON("TURN_END", () => {
            // cleanup before the next turn starts
            this.wordAPI.cleanup();
            this.wordAPI.broadcastWordUpdate(this.session);

            this.artist.isArtist = false;
            this.players.forEach((p) => {
                p.hasGuessed = false;
            });

            moveToNextState();
        });
    }

    init(): void {
        console.log("Turn", this.artist.getMetadata());
        this.EMIT("TURN_START", this);
    }

    updatePlayerScores() {
        Object.values(this.scoresObj).forEach((e) => {
            e.player.score = e.player.score + e.deltaPoints;
        });
    }

    calculateArtistScore(player: Player) {
        const { id } = player;
        const score = Math.max(this.guessCounter * 20, 0);
        this.scoresObj[id] = {
            player: player,
            deltaPoints: score,
            tries: 0,
        };
    }

    calculateGuesserScore(player: Player) {
        const { id } = player;
        const { tries } = this.scoresObj[id]!;
        const score = Math.max(500 - this.guessCounter * 10 - tries * 5, 0);
        this.scoresObj[id]!.deltaPoints = score;
    }

    getTurnResult(): TurnResultObj[] {
        // sort the scores
        const resultArr = Object.values(this.scoresObj);
        resultArr.sort((a, b) => {
            return a.deltaPoints > b.deltaPoints ? -1 : 1;
        });
        // get a map
        return resultArr.map((e) => ({
            name: e.player.name,
            deltaPoints: e.deltaPoints,
            accuracy: e.tries ? (1 / e.tries) * 100 : null,
        }));
    }

    /**
     *
     * @param n  number of words to be picked
     * @param customList the list used for picking up numbers
     * @param repetition If words are allowed to be repeated within the same Game
     */
    pickGuessWords(n: number, repetition: boolean = false, customList?: string[]): string[] {
        const wordlist = customList ?? this.game.guessWords;
        const exemptionList = !repetition ? this.game.pickedWords : [];
        const words = [];
        for (let i = 0; i < n; i++) {
            const word = this.pickWord(wordlist!, exemptionList);
            words.push(word!);
            this.game.pickedWords.push(word!);
            wordlist.splice(wordlist.indexOf(word!), 1);
        }
        return words;
    }

    /**
     *
     * @param n  number of words to be picked
     * @param wordsList the list used for picking up numbers
     * @param exemptions re-pick if the word picked is in the exemption list
     */
    pickWord(wordsList: string[], exemptions: string[] = []) {
        for (let i = 0; i < 10; i++) {
            const word = getRandomElement(wordsList);
            if (!exemptions.includes(word!)) return word;
        }
        throw new Error("Cannot find a new word from the given list.");
    }

    // proxy methods for on and emit, they just extend the exiting behaviour and do not alter it in any way
    EMIT<K>(
        eventName: keyof Events | K,
        ...args: K extends keyof Events ? Events[K] : never
    ): ReturnType<emitType> {
        // do the proxy work here
        return this.emit(eventName, ...args);
    }
    ON<K>(
        eventName: K | keyof Events,
        listener: K extends keyof Events
            ? Events[K] extends unknown[]
                ? (...args: Events[K]) => void
                : never
            : never,
    ): ReturnType<onType> {
        // do the proxy work here
        return this.on(eventName, listener);
    }
}
