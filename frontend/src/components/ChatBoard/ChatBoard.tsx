// src/Chatroom.jsx
import React, { Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MESSAGES_QUERY_KEY, USER_INFO_QUERY_KEY } from "@/lib/constants/query_keys";

import { useWS } from "../ws-provider";
import { useSendMessageCallback } from "./hooks";
import { Message } from "./Messages/Message";
import type { ChatMessage } from "./types";
import { handleWebSocketMessage } from "./ws";
import { ClientAction } from "$/server-types/client-msgs";

interface Props extends React.HTMLAttributes<HTMLElement> {}

// --- The Chatroom Component ---
export default function ChatBoard({ ...props }: Props) {
    const {
        ws: { raw: ws, sendMessage, addMessageEventListener },
        isConnected,
    } = useWS();
    //const ws = wsRef; // Ref to hold the WebSocket instance
    const queryClient = useQueryClient(); // Get QueryClient instance
    // const { isConnected, messages } = useReactQuerySubscription(ws, queryClient);

    useEffect(() => {
        addMessageEventListener!((event) => {
            const data: ClientAction = JSON.parse(event.data);
            handleWebSocketMessage(queryClient, data);
        });
    }, []);

    // --- Fetching / Displaying Messages using React Query ---
    // We initialize with an empty array. Updates will come via WebSocket.
    // `staleTime: Infinity` ensures react-query doesn't try to refetch this automatically.
    // We are manually controlling the cache updates via WebSocket messages.
    const { data: user_info = {} as any } = useQuery({
        queryKey: USER_INFO_QUERY_KEY,
        queryFn: () => [],
        staleTime: Infinity,
    });

    const { uid, ukey, uname } = useMemo(() => {
        const { id, key, uname } = user_info;
        return { uid: id, ukey: key, uname };
    }, [user_info]);

    const { data: messages = [] as ChatMessage[] } = useQuery({
        queryKey: MESSAGES_QUERY_KEY,
        queryFn: () => [] as ChatMessage[], // Initial data function (returns empty array)
        staleTime: Infinity, // Data is managed manually via WebSocket
    });

    // --- Send Message Handler ---
    const { handleSendChatMessage, newMessage, setNewMessage } = useSendMessageCallback(
        sendMessage!,
    );

    // --- Auto-scroll to bottom ---
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Scroll whenever messages array changes

    return (
        <div className="basis-1/5 h-full xl:mt-0 mt-5">
            <div className="chatroom h-full">
                <div className="chatroom-header bg-primary text-primary-foreground p-4 flex justify-between">
                    <div>
                        <span className="user-id">{uname}</span>
                    </div>
                    <div
                        id="conn-status"
                        className={`status ${isConnected ? " connected" : "disconnected"} h-5 w-5 block bg-red-500 rounded-full`}
                    ></div>
                </div>

                <div id="messages" className="">
                    {messages.length === 0 && (
                        <p className="no-messages">No messages yet. Start chatting!</p>
                    )}
                    {messages.map((msg, index) => (
                        <Message msg={msg} userId={uid} />
                    ))}
                    {/* Empty div to target for scrolling */}
                    <div ref={messagesEndRef} />
                </div>

                <form className="message-input" onSubmit={handleSendChatMessage}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={!isConnected} // Disable input if not connected
                    />
                    <button type="submit" disabled={!isConnected || newMessage.trim() === ""}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
