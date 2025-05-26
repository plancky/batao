// src/Chatroom.jsx
import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MESSAGES_QUERY_KEY } from "./constants";
import { useReactQuerySubscription, useSendMessageCallback } from "./hooks";
import { connectWebSocket } from "./ws";

// --- Helper function to generate a simple user ID ---
// In a real app, this would come from authentication
const getUserId = () => {
    if (!sessionStorage.getItem("chatUserId")) {
        sessionStorage.setItem("chatUserId", `User_${Math.random().toString(36).substring(2, 7)}`);
    }
    return sessionStorage.getItem("chatUserId")!;
};

// --- The Chatroom Component ---
export default function ChatBoard() {
    const [userId] = useState(getUserId()); // Get or generate a user ID

    const ws = useRef<WebSocket | null>(null); // Ref to hold the WebSocket instance
    const queryClient = useQueryClient(); // Get QueryClient instance
    const { isConnected, messages } = useReactQuerySubscription(ws, queryClient);

    // --- Send Message Handler ---
    const { handleSendMessage, newMessage, setNewMessage } = useSendMessageCallback(ws, userId);

    // --- Auto-scroll to bottom ---
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Scroll whenever messages array changes

    return (
        <div className="basis-1/5 h-full xl:mt-0 mt-5 xl:col-[right_sidebar]">
            <div className="chatroom h-full">
                <div className="chatroom-header bg-gray-700 text-white border-gray-600">
                    <div>
                        <h2>Chat Board</h2>
                        <span className="user-id">{userId}</span>
                    </div>
                    <div>
                        <span className={`status `}>
                            <div
                                className={`h-5 w-5 ${isConnected ? "connected" : "disconnected"} block [&.connected]:bg-green-400 bg-red-500 rounded-full`}
                                id="statusIndicator"
                            ></div>
                        </span>
                    </div>
                </div>

                <div className="messages">
                    {messages.length === 0 && (
                        <p className="no-messages">No messages yet. Start chatting!</p>
                    )}
                    {messages.map((msg, index) => (
                        <div
                            key={msg.id || index}
                            className={`message ${msg.sender === userId ? "sent" : "received"}`}
                        >
                            <span className="sender">
                                {msg.sender === userId ? "You" : msg.sender}:
                            </span>
                            <span className="text">{msg.text}</span>
                            <span className="timestamp">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                            {/* Optional: Display sending status for optimistic updates */}
                            {/* {msg.status === 'sending' && <span className="status-sending"> (Sending...)</span>} */}
                        </div>
                    ))}
                    {/* Empty div to target for scrolling */}
                    <div ref={messagesEndRef} />
                </div>

                <form className="message-input" onSubmit={handleSendMessage}>
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
