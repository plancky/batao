import React from "react";

import { ChatMessageTypes } from "$/server-types/constants/constants";

import { ChatMessage } from "../types";
import { AdminMessage } from "./AdminMessage";
import { PlayerMessage } from "./PlayerMessage";

interface Props extends React.HTMLAttributes<HTMLElement> {
    msg: ChatMessage;
    userId: string;
}

export function Message({ msg, userId, ...props }: Props) {
    const { type, msg: msgObj } = msg;
    switch (type) {
        case ChatMessageTypes.ADMIN:
            return (
                <AdminMessage
                    {...props}
                    key={msgObj.id}
                    cls={msgObj.cls}
                    text={msgObj.text}
                    timestamp={msgObj.timestamp}
                />
            );

            break;

        case ChatMessageTypes.USER: {
            const { id, name, cls, text, sid, timestamp } = msgObj;
            return (
                <PlayerMessage
                    {...props}
                    key={id}
                    name={name}
                    userId={userId}
                    senderId={sid}
                    cls={cls}
                    text={text}
                    timestamp={timestamp}
                />
            );
        }
        default:
            break;
    }
    return <></>;
}
