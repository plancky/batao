import { ServerAction } from "$/server-types/server-msgs";

import { PathObj } from "./draw";

export const enum PathTypes {
    dot = "dot",
    segement = "segment",
}

interface DrawingState {
    isDrawing: boolean;
    lastX: number;
    lastY: number;
    currentColor: string;
    currentLineWidth: number;
    canvasBackgroundColor: string;
    pathsArray: PathObj[][];
    redoArray: PathObj[][];
}

type ControlElements = {
    statusIndicator: HTMLElement;
    colorButtons: HTMLElement[];
    pencilSizeSlider: HTMLInputElement;
    pencilSizeValue: HTMLElement;
    clearButton: HTMLElement;
    undoButton: HTMLElement;
};

export abstract class DrawingBoardInterface {
    protected WEBSOCKET_URL!: string;
    protected socket: WebSocket | null = null;
    protected container!: HTMLElement;
    protected isSpectator!: boolean;
    protected canvas!: HTMLCanvasElement;
    protected ctx!: CanvasRenderingContext2D;
    protected drawingState!: DrawingState;
    protected controls!: ControlElements;

    constructor(container: HTMLElement) {}

    protected abstract setupButtons(): void;
    protected abstract re_draw(): void;
    abstract initialize(ws: WebSocket | undefined): void;
    protected abstract resizeCanvas(): void;
    abstract eventListeners(): void;

    protected abstract connectWebSocket(): void;
    protected abstract sendWebSocketMessage(socket: WebSocket, data: ServerAction): void;

    protected abstract clearCanvasLocal(): void;
    protected drawDot!: (x: number, y: number, color: string, size: number) => void;
    protected drawSegment!: (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        color: string,
        size: number,
    ) => void;
    protected drawPathObj!: (X: PathObj, normalized?: boolean) => void;

    protected abstract undoLocal(): void;

    protected drawHandlers!: {
        startDrawing: (event: MouseEvent | TouchEvent) => void;
        mouseMoveHandler: (event: MouseEvent | TouchEvent) => void;
        stopDrawing: (event: MouseEvent | TouchEvent) => void;
    };
}

export type DrawingBoardInstanceType = InstanceType<typeof DrawingBoardInterface>;
