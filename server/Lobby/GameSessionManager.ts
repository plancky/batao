import { GameSessionImpl } from "@/GameSession/GameSession";
import { GameSession } from "@/GameSession/types";

import { GameSessionManager } from "./types";

export class GameSessionManagerImpl extends GameSessionManager {
    constructor() {
        super();
        this.gameSessions = {};
    }

    createNewSession() {
        const session = new GameSessionImpl();
        this.gameSessions[session.sessionId] = session;
        return session;
    }

    getSessionById(sessionId: string) {
        return sessionId ? this.gameSessions[sessionId] : undefined;
    }
}

const SessionManager = Object.freeze(new GameSessionManagerImpl());
export default SessionManager;
