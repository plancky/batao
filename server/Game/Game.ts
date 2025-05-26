import EventEmitter from "node:events";

import type { GameSession } from "@/GameSession/types";
import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload } from "@/types/chat";
import type { GameConfig } from "@/types/server-msgs";

import { Clock } from "./Clock";
import type { GameState } from "./GameStates/State";
import { Waiting } from "./GameStates/Waiting";
import { Round } from "./Round";
import { Turn } from "./Turn";

type Events = {
    GAME_STATE_UPDATE: [any];
    GAME_START: [];
    GAME_END: [];
    CANVAS_ACTION: [Player, CanvasActionPayload];
    CHAT_INPUT: [Player, ChatInputPayload];
};

export class Game extends EventEmitter<Events> {
    // (TEST): words dictionary to pick words from.
    guessWords!: string[];
    // Config of the game set by the owner
    config!: {
        rounds: number;
        drawtime: number;
        hints: number;
        wordCount: number;
        customWords?: string[];
    };

    // clock
    clock: Clock = new Clock();

    // state variables
    // reference to current Round instance
    currRound!: Round;
    // current round number
    _round!: number;
    get currRoundCount() {
        return this._round;
    }
    set currRoundCount(val: number) {
        this._round = val > this.config.rounds ? this._round : val;
    }
    // reference to current Turn instance
    currTurn!: Turn;
    pickedWords: string[] = [];
    readonly session!: GameSession;
    private players!: Set<Player>;

    state!: GameState;

    constructor(session: GameSession, players: Set<Player>, config: GameConfig) {
        super();
        this.guessWords = ["cat", "dog", "neanderthal", "gunda", "not-like-us"];
        this.config = {
            rounds: config?.rounds ?? 3,
            drawtime: config?.drawtime ?? 60,
            wordCount: config?.words ?? 3,
            hints: config?.hints ?? 3,
        };

        this.session = session;
        this.players = players;
        this.currRoundCount = 0;

        this.state = new Waiting(this);
        this.on("CANVAS_ACTION", this.handleCanvasAction);
        this.on("CHAT_INPUT", this.handleChatInput);
    }

    start() {
        // broadcast gameState to players
        this.emit("GAME_START");
        this.runNextRound();
        // initiate a turn
        // when turn has ended run the next turn callback
    }

    runNextRound() {
        if (this._round + 1 > this.config.rounds) {
            this.emit("GAME_END");
            return 0;
        }
        this.currRoundCount++;
        console.log("Round: ", this._round);
        const round = new Round(this, this.session, this.players);
        round.init();
        this.currRound = round;
        this.currTurn = this.currRound.currTurn;
        round.ON("ROUND_END", this.onRoundEnd.bind(this));
    }

    onRoundEnd(round: Round) {
        // remove existing listeners on prev turn object
        round.removeAllListeners("ROUND_END");
        // run next turns
        this.runNextRound();
    }

    // obsolete: has to be moved to GameState
    getGameStateVars() {
        const players = [...this.players].map((player) => player.getState.call(player));

        const {
            currRoundCount,
            currTurn: { guessWord },
        } = this;

        const artist = this.currRound.artist?.getState();

        return {
            currRoundCount,
            artist,
            guessWord,
            players,
        };
    }
    // Change State
    changeState(state: GameState) {
        state.init();
        this.state = state;
    }

    // General Input event handlers
    handleCanvasAction(player: Player, payload: CanvasActionPayload): void {
        this.state.handleCanvasAction.call(this.state, player, payload);
    }

    handleChatInput(player: Player, payload: ChatInputPayload): void {
        this.state.handleChatMessage.call(this.state, player, payload);
    }

    // Clock related methods
    get tick() {
        return this.clock.tick;
    }
}
