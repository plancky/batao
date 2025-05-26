import { ServerActionTypes } from "$/server-types/constants";

import {
    drawDot,
    drawPathObj,
    drawSegment,
    mouseMoveHandler,
    putImageData,
    startDrawingHandler,
    stopDrawingHandler,
} from "./draw";
import { DrawingBoardInterface } from "./types/types";
import { connectWebSocket, handleWebSocketMessage } from "./ws";
import { sendWebSocketMessage } from "./ws-helpers";

export class DrawingBoard extends DrawingBoardInterface {
    constructor(container: HTMLElement) {
        super(container);
        // Get canvas element and context
        this.container = container;
        this.canvas = document.getElementById("drawingCanvas") as HTMLCanvasElement;
        this.ctx = this.canvas?.getContext("2d")!;

        // Drawing state variables
        this.drawingState = {
            isDrawing: false,
            lastX: 0,
            lastY: 0,
            currentColor: "white",
            currentLineWidth: 5,
            canvasBackgroundColor: "#36393f",
            pathsArray: [],
        };

        this.drawHandlers = {
            startDrawing: startDrawingHandler.bind(this),
            mouseMoveHandler: mouseMoveHandler.bind(this),
            stopDrawing: stopDrawingHandler.bind(this),
        };

        this.controls = {
            statusIndicator: container.querySelector("#statusIndicator")!,
            colorButtons: Array.from(container.querySelectorAll(".color-button")),
            pencilSizeSlider: container.querySelector("#pencilSize") as HTMLInputElement,
            pencilSizeValue: container.querySelector("#pencilSizeValue")!,
            clearButton: container.querySelector("#clearButton")!,
        };

        const ws_url = new URL("/wsgs", window.location.origin);
        ws_url.protocol = "ws";
        this.WEBSOCKET_URL = ws_url.toString();
    }

    protected makeSpectator() {
        this.isSpectator = true;
        this.container.classList.add("spectator");
    }

    protected makeArtist() {
        this.isSpectator = false;
        this.container.classList.remove("spectator");
    }

    protected setupButtons = () => {
        // Get controls
        const { colorButtons, pencilSizeSlider, pencilSizeValue, clearButton } = this.controls;
        const { canvas, ctx } = this;

        // Color selection
        colorButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const currentActive = document.querySelector(".color-button.active");
                if (currentActive) {
                    currentActive.classList.remove("active", "border-white");
                    currentActive.classList.add("border-gray-500");
                }
                button.classList.add("active", "border-white");
                button.classList.remove("border-gray-500");
                this.drawingState.currentColor = button.dataset.color!;
                // Update context immediately if needed, or rely on startDrawing/draw
                // ctx.strokeStyle = currentColor;
                // ctx.fillStyle = currentColor;
            });
        });

        // Pencil size slider
        pencilSizeSlider.addEventListener("input", (e: any) => {
            this.drawingState.currentLineWidth = e.target.value;
            pencilSizeValue.textContent = `${this.drawingState.currentLineWidth}`;
            // Update context immediately if needed, or rely on startDrawing/draw
            // ctx.lineWidth = currentLineWidth;
        });

        // Clear button
        clearButton.addEventListener("click", () => {
            this.clearCanvasLocal();
            // empty local draw state
            this.drawingState.pathsArray = [];
            this.sendWebSocketMessage(this.socket!, {
                type: ServerActionTypes.CANVAS_CLEAR,
            });
        });
    };

    // re_draw from pathObjsArray
    protected re_draw = () => {
        const { canvas, ctx } = this;

        const { pathsArray } = this.drawingState;

        pathsArray.forEach((pathObj, index, length) => {
            drawPathObj.call(this, pathObj, true);
        });
    };

    // Function to resize canvas to fit its container
    protected resizeCanvas = () => {
        const { canvas, ctx } = this;

        const container = canvas.parentElement!;
        // Store current drawing to redraw after resize
        // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        this.clearCanvasLocal();
        this.re_draw.call(this);
        // Restore drawing data
        // ctx.putImageData(imageData, 0, 0);
        /*
        putImageData(
            ctx,
            imageData,
            0,
            0,
            0,
            0,
            imageData.width,
            imageData.height,
            canvas.width,
            canvas.height,
        );
        */

        // Re-apply global drawing settings after resize (lineCap/Join)
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    };

    protected connectWebSocket = connectWebSocket.bind(this);
    protected sendWebSocketMessage = sendWebSocketMessage.bind(this);

    // Initial setup
    initialize = (ws?: WebSocket | undefined) => {
        const { canvas, ctx } = this;
        const { canvasBackgroundColor, currentColor, currentLineWidth } = this.drawingState;
        const { pencilSizeSlider, pencilSizeValue } = this.controls;

        // Set initial canvas background
        ctx.fillStyle = canvasBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set initial drawing styles
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = currentLineWidth; // Set initial width
        ctx.strokeStyle = currentColor; // Set initial color

        // disable drawing functionality unless the player is the artist
        //this.makeSpectator();

        // initialise websocket connection
        try {
            this.connectWebSocket(ws);
        } catch (e) {
            console.error("error occured while connecting...", e);
        }
        setTimeout(() => {
            // Resize canvas initially
            this.resizeCanvas();
        }, 25);
        // Add event-listeners
        this.eventListeners();
        this.setupButtons();

        // Set initial active button state
        const initialActiveButton = document.querySelector(".color-button.active") as HTMLElement;

        if (initialActiveButton) {
            initialActiveButton.classList.add("border-white");
            initialActiveButton.classList.remove("border-gray-500");
            this.drawingState.currentColor = initialActiveButton.dataset.color!; // Ensure currentColor matches active button
        }
        // Set initial slider value display
        pencilSizeValue.textContent = `${currentLineWidth}`;
        pencilSizeSlider.value = `${currentLineWidth}`;
    };

    // --- Drawing Functions ---
    protected drawSegment: DrawingBoardInterface["drawSegment"] = drawSegment.bind(this);
    protected drawDot: DrawingBoardInterface["drawDot"] = drawDot.bind(this);
    protected drawPathObj: DrawingBoardInterface["drawPathObj"] = drawPathObj.bind(this);

    handleWebSocketMessage = handleWebSocketMessage.bind(this);

    // Clears the canvas locally (used by clear button and remote message)
    protected clearCanvasLocal() {
        const {
            ctx,
            drawingState: { canvasBackgroundColor },
            canvas,
        } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the background color
        ctx.fillStyle = canvasBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    eventListeners = () => {
        // Add resize listener
        window.addEventListener("resize", this.resizeCanvas);

        const { startDrawing, mouseMoveHandler: draw, stopDrawing } = this.drawHandlers;
        // --- Event Listeners ---
        // Mouse events
        this.canvas.addEventListener("mousedown", startDrawing);
        this.canvas.addEventListener("mousemove", draw);
        this.canvas.addEventListener("mouseup", stopDrawing);
        this.canvas.addEventListener("mouseleave", stopDrawing); // Stop if cursor leaves canvas

        // Touch events
        this.canvas.addEventListener("touchstart", startDrawing);
        this.canvas.addEventListener("touchmove", draw);
        this.canvas.addEventListener("touchend", stopDrawing);
        this.canvas.addEventListener("touchcancel", stopDrawing); // Stop if touch is interrupted
    };
}
