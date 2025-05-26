import { useCallback, useMemo } from "react";

import { ServerActionTypes } from "$/server-types/constants/constants";
import { GameStates } from "$/server-types/constants/game-constants";
import { ServerAction } from "$/server-types/server-msgs";
import clsx from "clsx";

import { useGameState, usePlayerStates, useUserState, useWordSelWords } from "@/lib/hooks";

import { Button } from "../ui/button";
import { useWS } from "../ws-provider";
import { DrawBoardOverlayContainer } from "./DrawBoardOverlay";

export function WordSelOverlay() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const gameState = useGameState();
    const {
        data: { isArtist, id: userId },
    } = useUserState();

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

    const { data } = usePlayerStates();
    const memoizedArtist = useMemo(() => {
        const artist = Object.values(data).find((p) => p.isArtist);
        return artist!;
    }, [data]);
    const { name, id } = memoizedArtist ?? {};

    return (
        <>
            <DrawBoardOverlayContainer show={show}>
                {id === userId ? (
                    <>
                        <ul className="flex w-full items-center justify-center gap-5">
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
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span>{`${name} is selecting a word.`}</span>
                    </div>
                )}
            </DrawBoardOverlayContainer>
        </>
    );
}
