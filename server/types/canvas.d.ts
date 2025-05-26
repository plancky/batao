import type { PathObj } from "frontend/src/components/DrawBoard/types/draw";

import type { CanvasActions } from "./constants";

export type CanvasActionPayload =
    | DrawActionPayload
    | ClearActionPayload
    | SaveStateActionPayload
    | InitialStateActionPayload;

export interface DrawActionPayload {
    type: CanvasActions.CANVAS_DRAW;
    pathObj: PathObj;
}

export interface InitialStateActionPayload {
    type: CanvasActions.CANVAS_INITIAL_STATE;
    pathsStr: string;
}

export interface SaveStateActionPayload {
    type: CanvasActions.CANVAS_SAVE_PATHS;
    pathsStr: string;
}

export interface ClearActionPayload {
    type: CanvasActions.CANVAS_CLEAR;
}
