import { RefObject, useEffect, useRef } from "react";

import { useUserState } from "@/lib/hooks";

import { DrawBoardOverlay } from "../DrawBoardOverlay/DrawBoardOverlay";
import Undo from "../icons/undo.svg?react";
import { useWS } from "../ws-provider";
import { DrawingBoard } from "./main";

interface Props extends React.HTMLAttributes<HTMLElement> {}

declare global {
    interface Window {
        draw: DrawingBoard;
    }
}

export default function DrawBoard({ ...props }: Props) {
    const {
        ws: { raw: ws },
        isConnected,
    } = useWS();
    const drawAPI = useRef<DrawingBoard | undefined>(undefined);

    useEffect(() => {
        const handleContentLoaded = () => {
            drawAPI.current = new DrawingBoard(document.querySelector("#drawContainer")!);
            drawAPI.current?.makeSpectator();
            drawAPI.current?.initialize(ws!.current);
            window.draw = drawAPI.current;
        };

        if (document.readyState !== "loading") {
            handleContentLoaded();
        } else {
            document.addEventListener("DOMContentLoaded", handleContentLoaded);
        }

        // Optional: Clean up the event listener
        return () => {
            document.removeEventListener("DOMContentLoaded", handleContentLoaded);
        };
    }, [ws]);

    const {
        data: { isArtist },
    } = useUserState();

    useEffect(() => {
        if (isArtist) {
            drawAPI.current?.makeArtist();
        } else {
            drawAPI.current?.makeSpectator();
        }
    }, [isArtist, drawAPI]);

    return (
        <>
            <div id="drawContainer" className="flex max-h-screen w-full flex-col gap-5">
                <div className="#h-full #flex-1 relative aspect-video w-full overflow-hidden rounded-lg border border-gray-600 bg-gray-900 shadow-lg">
                    <DrawBoardOverlay />
                    <canvas
                        id="drawingCanvas"
                        className="rounded-lg [.spectator_&]:pointer-events-none"
                    ></canvas>
                </div>

                <div className="controls bg-primary/15 relative flex w-full flex-wrap items-center justify-center gap-3 rounded-lg border border-gray-600 p-4 shadow-md md:gap-4 [.spectator_&]:hidden">
                    <div className="flex w-full flex-wrap items-center justify-center gap-2">
                        <span className="mr-2 text-sm font-medium">Color:</span>
                        <button
                            className="color-button active h-8 w-8 rounded-full border-2 border-gray-500 bg-white"
                            data-color="white"
                        ></button>
                        <button
                            className="color-button h-8 w-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#f04747" }}
                            data-color="#f04747"
                        ></button>{" "}
                        <button
                            className="color-button h-8 w-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#7289da" }}
                            data-color="#7289da"
                        ></button>{" "}
                        <button
                            className="color-button h-8 w-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#43b581" }}
                            data-color="#43b581"
                        ></button>{" "}
                        <button
                            className="color-button h-8 w-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#faa61a" }}
                            data-color="#faa61a"
                        ></button>{" "}
                        <button
                            className="color-button h-8 w-8 rounded-full border-2 border-gray-500 bg-black"
                            data-color="black"
                        ></button>
                        <button
                            className="color-button flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-500 text-gray-400"
                            style={{ backgroundColor: "#36393f" }}
                            data-color="#82888f"
                            title="Eraser"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-eraser-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z" />
                            </svg>
                        </button>
                        <button
                            className="control-button ml-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-500 p-1 text-gray-400"
                            id="undoButton"
                        >
                            <Undo />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="pencilSize" className="text-sm font-medium text-gray-300">
                            Size:
                        </label>
                        <input
                            type="range"
                            id="pencilSize"
                            min="1"
                            max="30"
                            step="1"
                            value="5"
                            className="w-24 cursor-pointer appearance-none"
                        />
                        <span id="pencilSizeValue" className="w-6 text-right text-sm text-gray-300">
                            5
                        </span>
                    </div>

                    <button
                        id="clearButton"
                        className="control-button rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow hover:bg-red-700"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </>
    );
}
