import type { WSContext, WSMessageReceive } from "hono/ws";

import { GameSession } from "./types";
import { randomUUIDv7 } from "bun";

export class GameSessionImpl extends GameSession {
    constructor() {
        super();
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return randomUUIDv7("base64");
    }

    onOpen(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>) {
        console.log("connected!");
    }
    onMessage(evt: MessageEvent<WSMessageReceive>, ws: WSContext<Bun.ServerWebSocket<undefined>>) {
        const message = evt.data.toString();
        console.log(`Message from client: ${message}`);
        try {
            // Attempt to parse the message (assuming JSON)
            // const data: MessageData = JSON.parse(message);
            // const val = wsMessageHandler.call(ServerContext, data);
            // if (val) {
            //     return;
            // }
            // Broadcast the received message to all *other* connected clients
            // broadcast(data, ws, ServerContext.clients); // Pass 'ws' to exclude sender
            // Optional: Handle specific message types on the server if needed
            // For example, storing drawing history or managing user states
            // if (data.type === 'request_state') {
            //     // Send current state back to the requesting client (implementation needed)
            //     // ws.send(JSON.stringify({ type: 'initial_state', ... }));
            // }
        } catch (error) {
            console.error("Failed to parse message or invalid message format:", message, error);
            // Optionally send an error back to the client
            // ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    }
    onClose(evt: CloseEvent, ws: WSContext<Bun.ServerWebSocket<undefined>>) {
        console.log("Connection closed");
    }
    onError(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>) {}
}
