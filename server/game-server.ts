import { Hono } from "hono";
import { env } from "hono/adapter";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import { upgradeWebSocket, websocket } from "./bunws";
import { upgradeChatConnectionHandler } from "./chatRoom/chatRoomWS";
import type { ENV } from "./config";
import { upgradeWSGSConnectionHandler } from "./drawBoard/drawBoardWS";
import type { GameSession } from "./GameSession/types";
import SessionManager from "./Lobby/GameSessionManager";
import type { Variables } from "./types/variables";

// ...

const app = new Hono<{ Variables: Variables }>();

// cors middleware
app.use("/*", async (c, next) => {
    const { APP_URL, NODE_ENV } = env<ENV>(c);
    const localOrigins = ["http://localhost:3000", "http://localhost:3001"];
    const corsMiddleware = cors({
        origin: NODE_ENV == "production" ? APP_URL! : localOrigins,
        allowHeaders: ["Origin", "Content-Type", "Authorization"],
        allowMethods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
        credentials: true,
    });
    return await corsMiddleware(c, next);
});

app.post("/lobby", async (c) => {
    const key = c.req.header("X-secret-key");
    if (key == undefined) {
        throw new HTTPException(404, { message: "key not Found." });
    }
    const { CREATION_PASSCODE_HASH } = env<ENV>(c);
    const isMatch = await Bun.password.verify(key, atob(CREATION_PASSCODE_HASH));
    if (!isMatch) {
        return c.json({ error: "Wrong key" }, 404);
    }
    await new Promise((res, rej) => {
        setTimeout(() => {
            res(null);
        }, 1000);
    });
    const session = SessionManager.createNewSession();
    return c.json({ id: session.sessionId }, 200);
});

// Middleware to check if a session exists
app.post("/connect/:sessionId", async (c, next) => {
    const { sessionId } = c.req.param();
    const session = SessionManager.getSessionById(sessionId);
    if (!session) {
        throw new HTTPException(404, { message: "Session Not Found." });
    }
    c.set("session", session);
    return c.json({ id: session.sessionId });
});

app.all(
    "/connect/:sessionId",
    upgradeWebSocket((c) => {
        try {
            const { sessionId } = c.req.param();
            const session = SessionManager.getSessionById(sessionId!)!;
            if (!session) {
                throw new HTTPException(404, { message: "Session Not Found." });
            }
            const uname = c.req.query("uname");
            if (!uname) throw new Error("Username not found");
            const player = session.addPlayer(uname ?? "Random Player", false);

            const { onOpen, onMessage, onClose, onError } = player;
            return {
                onOpen: onOpen.bind(player),
                onMessage: onMessage.bind(player),
                onClose: onClose.bind(player),
                onError: onError.bind(player),
            };
        } catch (e) {
            throw new HTTPException(401, { message: "Unable to create session.", cause: e });
        }
    }),
);

export default app;
