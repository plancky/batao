import { WSMessageTypes } from "@/server-types/constants";
import { MessageData } from "@/server-types/messages";

import { PathObj } from "./types/draw";
import { DrawingBoardInstanceType } from "./types/types";

// --- WebSocket Connection ---
export function connectWebSocket(this: any) {
    const { statusIndicator } = this.controls;
    console.log("Attempting to connect to WebSocket server...");
    statusIndicator.classList.add("connecting");
    //statusText.textContent = "Connecting...";

    const socket = new WebSocket(this.WEBSOCKET_URL);
    this.socket = socket;

    socket.onopen = () => {
        console.log("WebSocket connection established.");
        statusIndicator.classList.remove("connecting");
        statusIndicator.classList.add("connected");
        statusIndicator.title = "Connected";
        // statusText.textContent = "Connected";
        // Optional: Request initial drawing state from server upon connection
        // sendWebSocketMessage({ type: 'request_state' });
    };

    socket.onmessage = (event: any) => {
        try {
            // console.debug("Message received:", event.data, typeof event.data);
            const data = JSON.parse(event.data);
            handleWebSocketMessage.call(this, data);
        } catch (error) {
            console.error("Failed to parse message or handle:", error);
        }
    };

    socket.onerror = (error: any) => {
        console.error("WebSocket error:", error);
        statusIndicator.title = "Error / Disconnected";
        //statusText.textContent = "Connection Error";
    };

    socket.onclose = (event: any) => {
        console.log("WebSocket connection closed:", event.reason || `Code ${event.code}`);
        statusIndicator.classList.remove("connected"); // Default (disconnected - red)
        statusIndicator.title = "Disconnected";
        //statusText.textContent = `Disconnected. ${event.reason || ""}`;
        this.socket = null;
        // Optional: Attempt to reconnect after a delay
        // setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    };
}

// --- Handle Incoming WebSocket Messages ---
export function handleWebSocketMessage(this: DrawingBoardInstanceType, data: MessageData) {
    const { drawPathObj, clearCanvasLocal } = this;
    switch (data.type) {
        case WSMessageTypes.CANVAS_DRAW:
            const { type, ...pathObj } = data;
            // Draw segment received from another user
            // console.debug(pathObj);
            this.drawingState.pathsArray.push(pathObj);
            drawPathObj.call(this, pathObj as PathObj, true);
            break;
        case WSMessageTypes.CANVAS_CLEAR:
            // Clear canvas as requested by another user
            clearCanvasLocal.call(this);
            this.drawingState.pathsArray = [];
            break;
        case WSMessageTypes.CANVAS_INITIAL_STATE:
            const ctx = this.ctx as CanvasRenderingContext2D;
            const canvas = this.canvas as HTMLCanvasElement;
            const {
                drawingState: { canvasBackgroundColor },
            } = this;

            if (data.pathsArray) {
                const paths = JSON.parse(atob(data.pathsArray));
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

        // Add cases for other potential message types (e.g., user join/leave notifications)
        default:
            console.log("Unknown message type:", data.type);
    }
}
