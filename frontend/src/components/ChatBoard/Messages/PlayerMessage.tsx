import React from "react";

interface Props extends React.HTMLAttributes<HTMLElement> {
    key: string;
    name: string;
    senderId: string;
    userId: string;
    text: string;
    timestamp: string;
    cls: string;
}

export function PlayerMessage({
    key,
    name,
    text,
    timestamp,
    cls,
    senderId,
    userId,
    ...props
}: Props) {
    const isUser = userId === senderId;
    return (
        <>
            <div
                key={key}
                className={`message flex items-end justify-between ${cls} ${isUser ? "sent" : "received"} font-sm w-full max-w-full`}
            >
                <div className="w-full flex [.sent_&]:justify-end gap-2 flex-1 text-wrap min-w-0">
                    <span className={`sender text-sm wrap-normal flex`}>
                        {isUser ? "You" : name}
                    </span>
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
