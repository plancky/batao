import { CanvasActions, ClientActionTypes, ServerActionTypes } from "$/server-types/constants";
import { ClientAction } from "$/server-types/client-msgs";

import { PathObj } from "./types/draw";
import { DrawingBoardInstanceType } from "./types/types";
import { sendWebSocketMessage } from "./ws-helpers";

// --- WebSocket Connection ---
export function connectWebSocket(this: any, ws?: WebSocket) {
    const { statusIndicator } = this.controls;
    console.log("Attempting to connect to WebSocket server...");
    statusIndicator?.classList.add("connecting");
    //statusText.textContent = "Connecting...";

    let socket = ws;
    if (ws == undefined) {
        socket = new WebSocket(this.WEBSOCKET_URL);
    }
    this.socket = socket;

    socket?.addEventListener("open", () => {
        console.log("WebSocket connection established.");
        statusIndicator?.classList.remove("connecting");
        statusIndicator?.classList.add("connected");
        // Optional: Request initial drawing state from server upon connection
        sendWebSocketMessage(this.socket, { type: ServerActionTypes.CANVAS_REQ_INITIAL });
    });

    socket?.addEventListener("message", (event) => {
        try {
            // console.debug("Message received:", event.data, typeof event.data);
            const data = JSON.parse(event.data);
            handleWebSocketMessage.call(this, data);
        } catch (error) {
            console.error("Failed to parse message or handle:", error);
        }
    });

    socket?.addEventListener("error", (event) => {
        console.error("WebSocket error:", event);
    });

    socket?.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event.reason || `Code ${event.code}`);
        statusIndicator?.classList.remove("connected"); // Default (disconnected - red)
        this.socket = null;
        // Optional: Attempt to reconnect after a delay
        // setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    });
}

// --- Handle Incoming WebSocket Messages ---
export function handleWebSocketMessage(this: DrawingBoardInstanceType, data: ClientAction) {
    const { drawPathObj, clearCanvasLocal } = this;
    if (data.type == ClientActionTypes.CANVAS_ACTION) {
        const { type } = data.payload;
        switch (type) {
            // Draw segment received from another user
            // console.debug(pathObj);
            case CanvasActions.CANVAS_DRAW: {
                const { pathObj } = data.payload;
                this.drawingState.pathsArray.push(pathObj);
                drawPathObj.call(this, pathObj as PathObj, true);
                break;
            }
            case CanvasActions.CANVAS_CLEAR: {
                // Clear canvas as requested by another user
                clearCanvasLocal.call(this);
                this.drawingState.pathsArray = [];
                break;
            }
            case CanvasActions.CANVAS_INITIAL_STATE: {
                const { pathsStr } = data.payload;
                const ctx = this.ctx as CanvasRenderingContext2D;
                const canvas = this.canvas as HTMLCanvasElement;
                const {
                    drawingState: { canvasBackgroundColor },
                } = this;

                if (pathsStr) {
                    const paths = JSON.parse(atob(pathsStr));
                    console.debug(paths);
                    this.drawingState.pathsArray = paths;
                    this.re_draw();
                }

                //if (data.imageData) {
                //    console.log(data.imageData);
                //    const img = new Image();
                //    img.src = data.imageData;
                //    img.onload = function () {
                //        ctx.clearRect(0, 0, canvas.width, canvas.height);
                //        // Set initial canvas background
                //        ctx.fillStyle = canvasBackgroundColor;
                //        ctx.fillRect(0, 0, canvas.width, canvas.height);
                //        img.width = canvas.width;
                //        img.height = canvas.height;
                //        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                //    };
                //    this.resizeCanvas();
                //}

                console.info("Received initial state.");
                break;
            }

            // Add cases for other potential message types (e.g., user join/leave notifications)
            default:
                console.log("Unknown message type:", data.type);
        }
    }
}
