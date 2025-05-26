import type { WSContext, WSEvents, WSMessageReceive } from "hono/ws";

import type { ServerWebSocket } from "bun";

export abstract class GameSession {
    sessionId!: string;
    constructor() {}
    abstract generateSessionId(): string;
    // ws connection callbacks
    abstract onOpen(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>): void;
    abstract onMessage(
        evt: MessageEvent<WSMessageReceive>,
        ws: WSContext<Bun.ServerWebSocket<undefined>>,
    ): void;
    abstract onClose(evt: CloseEvent, ws: WSContext<Bun.ServerWebSocket<undefined>>): void;
    abstract onError(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>): void;
}
