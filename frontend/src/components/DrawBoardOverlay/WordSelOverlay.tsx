import { useCallback } from "react";

import { GameStates } from "$/game/constants";
import { ServerActionTypes } from "$/server-types/constants";
import { ServerAction } from "$/server-types/server-msgs";

import { useGameState, useWordSelWords } from "@/lib/hooks";

import { Button } from "../ui/button";
import { useWS } from "../ws-provider";

export function WordSelOverlay() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const gameState = useGameState();
    const show = gameState === GameStates.WORD_SEL;
    const words = useWordSelWords();

    const selectWord = useCallback(
        (word: string) => {
            sendMessage!({
                type: ServerActionTypes.SEL_WORD,
                payload: {
                    word,
                },
            } as ServerAction);
        },
        [isConnected],
    );

    return (
        <>
            <div className={`absolute h-full w-full inset-0 z-10 ${show ? "flex" : "hidden"}`}>
                <ul className="flex justify-center w-full items-center gap-5">
                    {words.map((word, index) => (
                        <li key={`word_${index}`}>
                            <Button
                                variant={"outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                    selectWord(word);
                                }}
                            >
                                {word}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
