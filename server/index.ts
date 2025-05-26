import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

import type { ServerWebSocket } from "bun";

import { broadcast } from "./broadcast";
import { wsMessageHandler } from "./messageHandler";
import type { MessageData } from "./types/messages";
import { MessageDataTypes } from "./types/types";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
// ...

const app = new Hono();

// Keep track of connected clients
const ServerContext = {
    clients: new Set(),
    canvasImageData: null,
    pathObjsArray: [] as any[],
    storePathObj: function (pathObj: any) {
        this.pathObjsArray.push(pathObj);
    },
};

app.get(
    "/api",
    upgradeWebSocket((c) => {
        return {
            onOpen(event, ws) {
                console.log("connected!");
                ServerContext.clients.add(ws); // Add new client to the set
                if (ServerContext.pathObjsArray) {
                    ws.send(
                        JSON.stringify({
                            type: MessageDataTypes.initial_state,
                            pathsArray: btoa(JSON.stringify(ServerContext.pathObjsArray)),
                        }),
                    );
                }
                // Optional: Send a welcome message or initial state to the newly connected client
                // ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to the drawing board!' }));
            },
            onMessage(event, ws) {
                // console.log(`Message from client: ${event.data}`);
                const message = event.data.toString();
                try {
                    // Attempt to parse the message (assuming JSON)
                    const data: MessageData = JSON.parse(message);

                    const val = wsMessageHandler.call(ServerContext, data);
                    if (val) {
                        return;
                    }
                    // Broadcast the received message to all *other* connected clients
                    broadcast(data, ws, ServerContext.clients); // Pass 'ws' to exclude sender

                    // Optional: Handle specific message types on the server if needed
                    // For example, storing drawing history or managing user states
                    // if (data.type === 'request_state') {
                    //     // Send current state back to the requesting client (implementation needed)
                    //     // ws.send(JSON.stringify({ type: 'initial_state', ... }));
                    // }
                } catch (error) {
                    console.error(
                        "Failed to parse message or invalid message format:",
                        message,
                        error,
                    );
                    // Optionally send an error back to the client
                    // ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
                }
            },
            onClose: (ws) => {
                console.log("Connection closed");
                ServerContext.clients.delete(ws); // Remove client from the set
                // Optional: Broadcast a 'user_left' message
                // broadcast({ type: 'user_left', userId: /* some identifier */ }, ws);
            },
        };
    }),
);

app.get("/api", (c) => {
    console.log("handler");
    return c.text("Hello Hono!");
});

export default {
    fetch: app.fetch,
    websocket,
};
