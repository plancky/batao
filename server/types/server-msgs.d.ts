import type { WordListCode } from "@/Word/types";

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

type GameConfig = {
    drawtime?: number;
    rounds?: number;
    hints?: number;
    words?: number;
    wordlist?: WordListCode;
};

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

export type SuccessResponse<T = void> = {
    success: true;
    message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
    success: false;
    error: string;
    isFormError?: boolean;
};
