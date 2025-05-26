import { useCallback } from "react";

import { ServerActionTypes } from "$/server-types/constants";
import { GameConfig, StartServerAction } from "$/server-types/server-msgs";
import { SessionStates } from "$/session/constants";

import { useGameConfig, useSessionState, useUserInfo } from "@/lib/hooks";

import { Button } from "./ui/button";
import { useWS } from "./ws-provider";

interface Props extends React.HTMLAttributes<HTMLElement> {}
export default function AdminPannel({ ...props }: Props) {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const { config } = useGameConfig();

    const reqStart = useCallback(() => {
        const data: StartServerAction = {
            type: ServerActionTypes.START,
            payload: config,
        };
        if (sendMessage) sendMessage(data);
    }, [isConnected, config]);

    const session_state = useSessionState();
    const { isOwner } = useUserInfo();

    const sessionIsWaiting = session_state == SessionStates.WAITING;

    return (
        <>
            {sessionIsWaiting && isOwner && (
                <div className="flex gap-5" {...props}>
                    <Button onClick={reqStart} className={"cursor-pointer"}>
                        Start
                    </Button>
                </div>
            )}
        </>
    );
}
