import { useEffect } from "react";

import { DrawingBoard } from "./drawBoard/main";

export default function DrawBoard() {
    useEffect(() => {
        const handleContentLoaded = () => {
            const drawAPI = new DrawingBoard(document.querySelector("#drawContainer")!);
            drawAPI.initialize();
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
    }, []);

    return (
        <>
            <div id="drawContainer" className="flex flex-col w-full max-h-screen flex-1 py-10">
                <h1 className="text-2xl font-semibold mb-4 text-gray-200 flex justify-between">
                    Drawing Pad
                    <div
                        className="h-5 w-5 block [&.connected]:bg-green-400 bg-red-500 rounded-full"
                        id="statusIndicator"
                    ></div>
                </h1>

                <div className="controls w-full bg-gray-700 p-4 rounded-lg shadow-md mb-4 flex flex-wrap items-center justify-center gap-3 md:gap-4  border border-gray-600">
                    <div className="flex gap-2 w-full items-center flex-wrap justify-center">
                        <span className="text-sm font-medium text-gray-300 mr-2">Color:</span>
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500 bg-white active"
                            data-color="white"
                        ></button>
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#f04747" }}
                            data-color="#f04747"
                        ></button>{" "}
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#7289da" }}
                            data-color="#7289da"
                        ></button>{" "}
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#43b581" }}
                            data-color="#43b581"
                        ></button>{" "}
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500"
                            style={{ backgroundColor: "#faa61a" }}
                            data-color="#faa61a"
                        ></button>{" "}
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500 bg-black"
                            data-color="black"
                        ></button>
                        <button
                            className="color-button w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center text-gray-400"
                            style={{ backgroundColor: "#36393f" }}
                            data-color="#36393f"
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
                            value="5"
                            className="w-24 cursor-pointer appearance-none"
                        />
                        <span id="pencilSizeValue" className="text-sm text-gray-300 w-6 text-right">
                            5
                        </span>
                    </div>

                    <button
                        id="clearButton"
                        className="control-button bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md shadow text-sm"
                    >
                        Clear
                    </button>
                </div>

                <div className="w-full bg-gray-900 aspect-video #h-full #flex-1 rounded-lg shadow-lg overflow-hidden border border-gray-600">
                    <canvas id="drawingCanvas" className="rounded-lg"></canvas>
                </div>
            </div>
        </>
    );
}
