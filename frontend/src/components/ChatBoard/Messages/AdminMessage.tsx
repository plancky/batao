import React from "react";

import { ChatMessageTypes } from "$/server-types/constants";

import { ChatMessage } from "../types";

interface Props extends React.HTMLAttributes<HTMLElement> {
    key: string;
    text: string;
    timestamp: string;
    cls: string;
}

export function AdminMessage({ key, text, timestamp, cls, ...props }: Props) {
    return (
        <>
            <div
                key={key}
                className={`message flex items-end justify-between ${cls} font-sm w-full max-w-full`}
            >
                <div className="w-full flex [.sent_&]:justify-end gap-2 flex-1 text-wrap min-w-0">
                    <div className="text min-w-0 whitespace-normal wrap-anywhere break-all">
                        {text}
                    </div>
                </div>
                <span className="timestamp pb-2">
                    {new Date(timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hourCycle: "h24",
                    })}
                </span>
            </div>
        </>
    );
}
