// src/Chatroom.jsx
import React, { Ref, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";

import { useChatMessages, useEssentialUserInfo, useUserInfo } from "@/lib/hooks";

import { useWS } from "../ws-provider";
import { useSendMessageCallback } from "./hooks";
import { Message } from "./Messages/Message";
import type { ChatMessage } from "./types";
import { handleWebSocketMessage } from "./ws";

interface Props extends React.HTMLAttributes<HTMLElement> {}

// --- The Chatroom Component ---
export default function ChatBoard({ ...props }: Props) {
    const {
        ws: { raw: ws, sendMessage, addMessageEventListener },
        isConnected,
    } = useWS();

    const queryClient = useQueryClient(); // Get QueryClient instance

    useEffect(() => {
        addMessageEventListener!((event) => {
            const data: ClientAction = JSON.parse(event.data);
            handleWebSocketMessage(queryClient, data);
        });
    }, [isConnected]);

    const { user_info } = useEssentialUserInfo();

    const { id: uid, key: ukey, uname } = user_info;

    const messages = useChatMessages();

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
        <div className="basis-1/5 h-full">
            <div className="chatroom h-full">
                <div className="chatroom-header bg-primary/10 p-4 flex justify-between">
                    <div>
                        <span className="user-id">{uname}</span>
                    </div>
                    <div
                        id="conn-status"
                        className={`status ${isConnected ? " connected" : "disconnected"} h-5 w-5 block bg-red-500 rounded-full`}
                    ></div>
                </div>

                <div id="messages" className="">
                    {messages.length === 0 ? (
                        <p className="no-messages">No messages yet. Start chatting!</p>
                    ) : (
                        <ul>
                            {messages.map((msg, index) => (
                                <Message msg={msg} userId={uid} />
                            ))}
                        </ul>
                    )}
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
