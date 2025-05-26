import type { GameSession } from "@/GameSession/types";

export abstract class GameSessionManager {
    protected gameSessions!: { [key: string]: GameSession };
    constructor() {}

    abstract createNewSession(): GameSession;
    abstract getSessionById(sessionId: string): GameSession | undefined;
}
