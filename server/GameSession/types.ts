import { EventEmitter, EventEmitterAsyncResource } from "node:events";

import type { Game } from "@/Game/Game";
import type { Player } from "@/Player/Player";

import type { SessionStates } from "./constants";

type Events = {
    tick: [number];
};

export abstract class GameSession extends EventEmitter<Events> {
    config!: {
        rounds: number;
        turnTime: number;
    };

    state!: SessionStates;
    game!: Game;
    sessionId!: string;
    players: Set<Player> = new Set();
    owner!: Player;
    constructor() {
        super();
    }
    abstract generateSessionId(): string;

    // player management
    abstract addPlayer(name: string, isowner: boolean): Player;
    abstract broadcastMessageToAllPlayers(data: any, exempt?: Set<Player> | Player): void;
    abstract broadcastMessage(players: Set<Player>, data: any): void;
    // ws connection callbacks
    /*
    abstract onOpen(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>): void;
    abstract onMessage(
        evt: MessageEvent<WSMessageReceive>,
        ws: WSContext<Bun.ServerWebSocket<undefined>>,
    ): void;
    abstract onClose(evt: CloseEvent, ws: WSContext<Bun.ServerWebSocket<undefined>>): void;
    abstract onError(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>): void;
    */
}
