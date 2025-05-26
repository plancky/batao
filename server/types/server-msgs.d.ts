import type { CanvasActionPayload } from "./canvas";
import type { ChatInputPayload } from "./chat";
import { CanvasActions, ClientActionTypes, ServerActionTypes } from "./constants";
import type { PlayerMetadata, PlayerState } from "./player";

// Server Action types
export type ServerAction =
    | StartServerAction
    | WordSelServerAction
    | CanvasServerAction
    | ChatInputServerAction;

export type StartServerAction = {
    type: ServerActionTypes.START;
    payload: GameConfig;
};

type GameConfig = any;

export type WordSelServerAction = {
    type: ServerActionTypes.SEL_WORD;
    payload: {
        word: string;
    };
};

export type CanvasServerAction = {
    type: ServerActionTypes.CANVAS_ACTION;
    payload: CanvasActionPayload;
};

export type ChatInputServerAction = {
    type: ServerActionTypes.CHAT_INPUT;
    payload: ChatInputPayload;
};
