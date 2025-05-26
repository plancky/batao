import type { GameStates } from "./game-constants";

export type GameStateUpdatePayload = TurnResultStatePayload | GenericStateUpdatePayload;

export interface GenericStateUpdatePayload {
    state: GameStates.PAUSED | GameStates.WAITING | GameStates.DRAWING | GameStates.WORD_SEL;
}

export interface TurnResultStatePayload {
    state: GameStates.RESULT;
    result: TurnResultObj[];
}

export type TurnResultObj = {
    name: string;
    deltaPoints: number;
    accuracy: string | null;
};
