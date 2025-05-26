import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ClientActionTypes, ServerActionTypes } from "$/server-types/constants";
import { ClientAction, ServerAction } from "$/server-types/client-msgs";

import { SEL_WORDS } from "@/lib/constants/query_keys";

import { Button } from "./ui/button";
import { useWS } from "./ws-provider";

export function DrawBoardOverlay() {
    const [hide, setHide] = useState(true);
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const { data: words = [] as string[] } = useQuery({
        queryKey: SEL_WORDS,
        queryFn: () => [],
        staleTime: Infinity,
    });

    useEffect(() => {
        addMessageEventListener!((event) => {
            const { type, payload } = JSON.parse(event.data) as ClientAction;
            switch (type) {
                case ClientActionTypes.PLAYER_IS_ARTIST:
                    console.log("Player is artist");
                    setHide(false);
                    break;

                default:
                    break;
            }
        });
    }, [ws]);
    return (
        <>
            <div className={`absolute h-full w-full inset-0 z-10 ${hide ? "hidden" : "flex"}`}>
                <ul className="flex justify-center w-full items-center gap-5">
                    {words.map((word, index) => (
                        <li key={`word_${index}`}>
                            <Button
                                variant={"outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                    sendMessage!({
                                        type: ServerActionTypes.SEL_WORD,
                                        payload: {
                                            word,
                                        },
                                    } as ServerAction);
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
