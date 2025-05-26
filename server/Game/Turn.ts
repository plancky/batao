import EventEmitter from "node:events";

import type { GameSession } from "@/GameSession/types";
import type { Player } from "@/Player/Player";
import type { IsArtistClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";

import type { Game } from "./Game";
import { getRandomElement } from "./utils";

type Events = {
    TURN_START: [Turn];
    TURN_END: [Turn];
    WORD_SEL_START: [Turn];
    WORD_SEL_END: [Turn];
    DRAW_START: [];
    DRAW_END: [];
    RESULT_START: [];
    RESULT_END: [];
};

type onType = EventEmitter<Events>["on"];
type emitType = EventEmitter<Events>["emit"];

export class Turn extends EventEmitter<Events> {
    private game!: Game;
    private session!: GameSession;
    private players!: Set<Player>;
    private artist!: Player;

    guessWordsSelectionList!: string[];
    guessWord!: string;
    gPlayers: Set<Player> = new Set();

    constructor(artist: Player, session: GameSession, game: Game, players: Set<Player>) {
        super();

        this.game = game;
        this.artist = artist;
        this.players = players;
        this.session = session;
        this.setup();
    }

    setup(): void {
        const game = this.game;
        const clk = game.clock;
        const wordSelDurr = 20;
        game.state.setTurn.call(game.state, this);

        this.ON("TURN_START", (e) => {
            this.guessWordsSelectionList = this.pickGuessWords(3, false);
            console.log("Turn has started..", this.guessWordsSelectionList);
            this.artist.isArtist = true;
            e.artist.sendMsg({
                type: ClientActionTypes.PLAYER_IS_ARTIST,
                payload: {
                    words: this.guessWordsSelectionList,
                },
            } as IsArtistClientAction);
            this.EMIT("WORD_SEL_START", this);
        });

        this.ON("WORD_SEL_START", (turn) => {
            game.changeState.call(game, game.state.nextState.call(game.state));
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
            // cleanup after word select
            this.artist.removeAllListeners("WORD_SELECTED");
            this.EMIT("DRAW_START");
        });

        const drawDurr = this.game.config.turnDuration;
        this.ON("DRAW_START", () => {
            game.changeState.call(game, game.state.nextState.call(game.state));
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
        });

        this.ON("DRAW_END", () => {
            this.artist.isArtist = false;
            this.EMIT("RESULT_START");
        });

        this.ON("RESULT_START", () => {
            this.game.changeState(this.game.state.nextState());
            this.EMIT("TURN_END", this);
        });

        this.ON("TURN_END", () => {
            this.game.changeState(this.game.state.nextState());
        });
    }

    init(): void {
        console.log("Turn", this.artist.getMetadata());
        this.EMIT("TURN_START", this);
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
