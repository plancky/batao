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
    const {
        user_info: { id },
    } = useEssentialUserInfo();
    useEffect(() => {
        if (addMessageEventListener) {
            console.log("attaching listeners");
            addMessageEventListener((event) => {
                const data: ClientAction = JSON.parse(event.data);
                gameStateUpdateListener(data, queryClient);
            });
            addMessageEventListener((event) => {
                const data: ClientAction = JSON.parse(event.data);
                playersStateUpdateListener(data, queryClient, id);
            });
        }
    }, [isConnected]);

    return (
        <>
            {!isConnected ? (
                <div className="h-full">
                    <div className="flex flex-col items-center justify-center h-full">
                        <InputForm />
                    </div>
                </div>
            ) : (
                <div className="min-h-screen xl:max-h-screen py-10 grid xl:gap-5 h-full game-session-layout-mobile xl:game-session-layout-xl grid-rows-1 text-white">
                    <MainArea />
                    <div className="xl:col-[left-sidebar] col-[left-half] row-span-1 row-start-2 xl:row-start-1">
                        <LeftSidebar />
                    </div>
                    <div className="xl:col-[right-sidebar] col-[right-half] row-span-1 row-start-2 xl:row-start-1">
                        <ChatBoard />
                    </div>
                </div>
            )}
        </>
    );
}
