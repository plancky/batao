import EventEmitter from "node:events";

import type { GameSession } from "@/GameSession/types";
import { Player } from "@/Player/Player";

import type { Game } from "./Game";
import { Turn } from "./Turn";

type Events = {
    ROUND_START: [Round];
    ROUND_END: [Round];
};

type onType = EventEmitter<Events>["on"];
type emitType = EventEmitter<Events>["emit"];

export class Round extends EventEmitter<Events> {
    private game!: Game;
    private session!: GameSession;
    private players!: Set<Player>;

    currTurn!: Turn;
    artist!: Player | undefined;
    playersIter!: SetIterator<Player>;

    constructor(game: Game, session: GameSession, players: Set<Player>) {
        super();

        this.game = game;
        this.session = session;
        this.players = players;
        this.playersIter = this.players.values();
    }

    init(): void {
        this.EMIT("ROUND_START", this);
        console.log("round")
        this.runNextTurn();
    }

    runNextTurn() {
        this.getNextArtist();
        if (!this.artist) {
            this.EMIT("ROUND_END", this);
            return 0;
        }
        const turn = new Turn(this.artist, this.session, this.game, this.players);
        turn.init();
        this.currTurn = turn;
        turn.ON("TURN_END", this.onTurnEnd.bind(this));
    }

    onTurnEnd(turn: Turn) {
        // remove existing listeners on prev turn object
        turn.removeAllListeners("TURN_END");
        // run next turns
        this.runNextTurn();
    }

    getNextArtist() {
        const next = this.playersIter?.next();
        if (next.done) {
            this.artist = undefined;
        }
        this.artist = next.value;
        return this.artist;
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
