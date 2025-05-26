import { useCallback } from "react";

import { ServerActionTypes } from "$/server-types/constants";
import { StartServerAction } from "$/server-types/client-msgs";

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

    return (
        <div className="flex gap-5" {...props}>
            <Button onClick={reqStart}>Start</Button>
        </div>
    );
}
