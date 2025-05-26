import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";

import { useEssentialUserInfo } from "@/lib/hooks";
import { gameStateUpdateListener } from "@/lib/listeners/game-state";
import { playersStateUpdateListener } from "@/lib/listeners/players-state";

import ChatBoard from "./ChatBoard/ChatBoard";
import { LeftSidebar } from "./LeftSidebar";
import MainArea from "./MainArea";
import { InputForm } from "./UserLoginForm/UserForm";
import { useWS } from "./ws-provider";

export function Game() {
    const {
        ws: { raw: ws, addMessageEventListener },
        isConnected,
    } = useWS();
    const queryClient = useQueryClient();
    useEffect(() => {
        if (isConnected && ws) {
            addMessageEventListener!((event) => {
                const data: ClientAction = JSON.parse(event.data);
                gameStateUpdateListener(data, queryClient);
            });
        }
    }, [ws, isConnected, queryClient]);

    const {
        user_info: { id },
    } = useEssentialUserInfo();
    useEffect(() => {
        if (isConnected && ws) {
            addMessageEventListener!((event) => {
                const data: ClientAction = JSON.parse(event.data);
                playersStateUpdateListener(data, queryClient, id);
            });
        }
    }, [isConnected, id, queryClient]);

    return (
        <>
            {!isConnected ? (
                <div className="h-full">
                    <div className="flex h-full flex-col items-center justify-center">
                        <InputForm />
                    </div>
                </div>
            ) : (
                <div className="game-session-layout-mobile xl:game-session-layout-xl grid h-full min-h-screen grid-rows-1 py-10 text-white xl:max-h-screen xl:gap-5">
                    <MainArea />
                    <div className="col-[left-half] row-span-1 row-start-2 xl:col-[left-sidebar] xl:row-start-1">
                        <LeftSidebar />
                    </div>
                    <div className="col-[right-half] row-span-1 row-start-2 xl:col-[right-sidebar] xl:row-start-1">
                        <ChatBoard />
                    </div>
                </div>
            )}
        </>
    );
}
