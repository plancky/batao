// --- Drawing Logic ---
import { CanvasActions, ServerActionTypes } from "$/server-types/constants";
import { CanvasServerAction } from "$/server-types/server-msgs";

import { type DotPathObj, type PathObj, type SegmentPathObject } from "./types/draw";
import { PathTypes, type DrawingBoardInstanceType } from "./types/types";
import { sendWebSocketMessage } from "./ws-helpers";

type MouseTouchEvent = MouseEvent | TouchEvent;
// Start drawing (mouse/touch)
export function startDrawingHandler(this: DrawingBoardInstanceType, event: MouseTouchEvent) {
    const coords = getCoordinates.call(this, event);
    if (!coords) return;

    if ("touches" in event) {
        event.preventDefault(); // Prevent default touch actions like scrolling
    }
    const { width, height } = this.canvas;

    const { currentLineWidth, currentColor } = this.drawingState;

    this.drawingState.isDrawing = true;
    [this.drawingState.lastX, this.drawingState.lastY] = [coords.x, coords.y];

    const { lastY, lastX } = this.drawingState;

    const pathObj: DotPathObj = {
        pathType: PathTypes.dot,
        x: lastX / width,
        y: lastY / height,
        color: currentColor,
        size: currentLineWidth / SIZE_NORMALIZING_FACTOR,
    };

    this.drawingState.pathsArray.push([pathObj]);
    drawPathObj.call(this, pathObj, true);

    // Send start draw event to server
    sendWebSocketMessage(this.socket!, {
        type: ServerActionTypes.CANVAS_ACTION,
        payload: {
            type: CanvasActions.CANVAS_DRAW,
            pathObj,
        },
    } as CanvasServerAction);
}

// Draw (mouse/touch)
export function mouseMoveHandler(this: DrawingBoardInstanceType, event: MouseTouchEvent) {
    const { isDrawing, currentLineWidth, currentColor, lastX, lastY } = this.drawingState;
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    if (!isDrawing) return;

    const coords = getCoordinates.call(this, event);
    if (!coords) return;

    if ("touches" in event) {
        event.preventDefault(); // Prevent default touch actions
    }

    const pathObj: SegmentPathObject = {
        pathType: PathTypes.segement,
        x0: lastX / width,
        y0: lastY / height,
        x1: coords.x / width,
        y1: coords.y / height,
        color: currentColor,
        size: currentLineWidth / SIZE_NORMALIZING_FACTOR,
    };

    const paths = this.drawingState.pathsArray;
    const lastArr = paths[paths.length - 1];
    lastArr.push(pathObj);
    drawPathObj.call(this, pathObj, true);

    // Update last position for the next segment
    [this.drawingState.lastX, this.drawingState.lastY] = [coords.x, coords.y];

    sendWebSocketMessage(this.socket!, {
        type: ServerActionTypes.CANVAS_ACTION,
        payload: {
            type: CanvasActions.CANVAS_DRAW,
            pathObj,
        },
    } as CanvasServerAction);
}

// Stop drawing (mouse/touch)
export function stopDrawingHandler(this: DrawingBoardInstanceType, event: MouseTouchEvent) {
    if (!this.drawingState.isDrawing) return;
    this.drawingState.isDrawing = false;
    // ctx.beginPath(); // End the current path segment - uncomment if lines connect unexpectedly
    const { canvas } = this;
    const ctx = this.ctx as CanvasRenderingContext2D;

    sendWebSocketMessage(this.socket!, {
        type: ServerActionTypes.CANVAS_ACTION,
        payload: {
            type: CanvasActions.CANVAS_SAVE_PATHS,
            pathsStr: btoa(JSON.stringify(this.drawingState.pathsArray)),
        },
    } as CanvasServerAction);
}

// Function to get coordinates relative to the canvas
export function getCoordinates(this: DrawingBoardInstanceType, event: MouseTouchEvent) {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ("touches" in event && event.touches.length > 0) {
        // Touch event
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else if ("clientX" in event) {
        // Mouse event
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    } else {
        return null; // No valid coordinates
    }
    // Clamp coordinates to stay within canvas bounds
    x = Math.max(0, Math.min(x, canvas.width));
    y = Math.max(0, Math.min(y, canvas.height));
    return { x, y };
}

export const drawPathObj: DrawingBoardInstanceType["drawPathObj"] = function (
    this: DrawingBoardInstanceType,
    pathObj: PathObj,
    normalized: boolean = false,
) {
    const { width, height } = this.canvas;
    switch (pathObj.pathType) {
        case PathTypes.dot: {
            let { x, y, color, size } = pathObj;
            if (normalized) {
                x *= width;
                y *= height;
                size *= NormalizingFactor(width, height);
            }
            drawDot.call(this, x, y, color, size);
            break;
        }
        case PathTypes.segement: {
            let { x0, x1, y0, y1, color, size } = pathObj;
            if (normalized) {
                x0 *= width;
                y0 *= height;
                x1 *= width;
                y1 *= height;
                size *= NormalizingFactor(width, height);
            }
            drawSegment.call(this, x0, y0, x1, y1, color, size);
            break;
        }
        default: {
            break;
        }
    }
};

// Draws a single dot (used for remote start_draw)
export function drawDot(
    this: DrawingBoardInstanceType,
    x: number,
    y: number,
    color: string,
    size: number,
) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

const SIZE_NORMALIZING_FACTOR = Math.sqrt(1478 * 1478 + 714 * 714);

const NormalizingFactor = (width: number, height: number) =>
    Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2));

const getNormalizedSize = (size: number, width: number, height: number) =>
    size / Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2));

const getSize = (size: number, width: number, height: number) =>
    size * Math.sqrt(Math.pow(height, 2) + Math.pow(width, 2));

export function drawSegment(
    this: DrawingBoardInstanceType,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    size: number,
) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round"; // Ensure styles are applied
    ctx.lineJoin = "round";
    ctx.stroke();
}

export function putImageData(
    ctx: CanvasRenderingContext2D,
    imageData: ReturnType<CanvasRenderingContext2D["getImageData"]>,
    dx: number,
    dy: number,
    dirtyX: number,
    dirtyY: number,
    dirtyWidth: number,
    dirtyHeight: number,
    scaleWidth: number,
    scaleHeight: number,
) {
    const data = imageData.data;
    const height = imageData.height;
    const width = imageData.width;
    dirtyX = dirtyX || 0;
    dirtyY = dirtyY || 0;
    dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
    dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
    const limitBottom = dirtyY + dirtyHeight;
    const limitRight = dirtyX + dirtyWidth;
    scaleWidth = scaleWidth || dirtyWidth;
    scaleHeight = scaleHeight || dirtyHeight;
    for (let y = dirtyY; y < limitBottom; y++) {
        for (let x = dirtyX; x < limitRight; x++) {
            const pos = y * width + x;
            ctx.fillStyle = `rgb(${data[pos * 4 + 0]} ${data[pos * 4 + 1]}
      ${data[pos * 4 + 2]} / ${data[pos * 4 + 3] / 255})`;
            ctx.fillRect(
                Math.ceil(x * (scaleWidth / dirtyWidth)) + dx,
                Math.ceil(y * (scaleHeight / dirtyHeight)) + dy,
                1,
                1,
            );
        }
    }
}
