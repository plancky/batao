import { useCallback } from "react";

import { ServerActionTypes } from "$/server-types/constants";
import { StartServerAction } from "$/server-types/server-msgs";
import { SessionStates } from "$/session/constants";

import { useSessionState, useUserInfo } from "@/lib/hooks";

import { Button } from "./ui/button";
import { useWS } from "./ws-provider";

interface Props extends React.HTMLAttributes<HTMLElement> {}
export default function AdminPannel({ ...props }: Props) {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const reqStart = useCallback(() => {
        const data: StartServerAction = {
            type: ServerActionTypes.START,
            payload: {},
        };
        if (sendMessage) sendMessage(data);
    }, [ws]);

    const session_state = useSessionState();
    const { isOwner } = useUserInfo();

    const sessionIsWaiting = session_state == SessionStates.WAITING;

    return (
        <>
            {sessionIsWaiting && isOwner && (
                <div className="flex gap-5" {...props}>
                    <Button onClick={reqStart}>Start</Button>
                </div>
            )}
        </>
    );
}
