import React, { FormEvent, Ref, useCallback, useEffect, useState } from "react";
import { RefObject } from "hono/jsx";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import { WSMessageTypes } from "@/server-types/constants";

import { MESSAGES_QUERY_KEY } from "./constants";
import { ChatMessage } from "./types";
import { connectWebSocket } from "./ws";

/*
export const useReactQuerySubscription = () => {
    const queryClient = useQueryClient();
    React.useEffect(() => {
        const websocket = new WebSocket(`wss://${location.origin}/`);
        websocket.onopen = () => {
            console.log("connected");
        };
        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            queryClient.setQueriesData(data.entity_key, (oldData) => {
                const update = (entity: any) =>
                    entity.id === data.id ? { ...entity, ...data.payload } : entity;
                return Array.isArray(oldData) ? oldData.map(update) : update(oldData);
            });
        };
        return () => {
            websocket.close();
        };
    }, [queryClient]);
};
*/

export const useReactQuerySubscription = (
    ws: RefObject<WebSocket | null>,
    queryClient: QueryClient,
) => {
    const [isConnected, setIsConnected] = useState(false);
    // --- Fetching / Displaying Messages using React Query ---
    // We initialize with an empty array. Updates will come via WebSocket.
    // `staleTime: Infinity` ensures react-query doesn't try to refetch this automatically.
    // We are manually controlling the cache updates via WebSocket messages.
    const { data: messages = [] as ChatMessage[] } = useQuery({
        queryKey: MESSAGES_QUERY_KEY,
        queryFn: () => [], // Initial data function (returns empty array)
        staleTime: Infinity, // Data is managed manually via WebSocket
    });

    // --- WebSocket Connection Logic ---
    useEffect(() => {
        const handleContentLoaded = () => {
            ws.current = connectWebSocket(queryClient, setIsConnected);
        };

        if (document.readyState !== "loading") {
            handleContentLoaded();
        } else {
            document.addEventListener("DOMContentLoaded", handleContentLoaded);
        }
        // --- Cleanup on component unmount ---
        return () => {
            document.removeEventListener("DOMContentLoaded", handleContentLoaded);
            console.log("Closing WebSocket connection...");
            ws.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryClient]); // Re-run effect only if queryClient changes (which it shouldn't often)

    return { isConnected, messages };
};

export const useSendMessageCallback = (ws: RefObject<WebSocket | null>, userId: string) => {
    const [newMessage, setNewMessage] = useState("");
    return {
        handleSendMessage: useCallback(
            (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault(); // Prevent form submission page reload
                if (newMessage.trim() === "") return; // Don't send empty messages

                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    const messagePayload = {
                        // id: crypto.randomUUID(), // Generate a unique ID client-side (optional, depends on backend)
                        text: newMessage,
                        sender: userId, // Include sender identification
                        timestamp: new Date().toISOString(),
                    };

                    try {
                        console.log("Sending message:", messagePayload);
                        ws.current.send(
                            JSON.stringify({
                                type: WSMessageTypes.CHAT_NEW_MESSAGE,
                                payload: messagePayload,
                            }),
                        );
                        setNewMessage(""); // Clear input field after sending

                        // --- OPTIONAL: Optimistic Update ---
                        // You *could* optimistically update the cache here, but often
                        // it's simpler to just let the WebSocket echo the message back
                        // and handle it via the `onmessage` handler for consistency.
                        // If you DO optimistic updates, you need careful handling
                        // in `onmessage` to avoid duplicates (e.g., using message IDs).
                        /*
                        queryClient.setQueryData(MESSAGES_QUERY_KEY, (oldData = []) => [
                        ...oldData,
                        { ...messagePayload, status: 'sending' }, // Add temporary sending status
                        ]);
                        */
                    } catch (error) {
                        console.error("Failed to send message:", error);
                        // Optional: Handle send failure (e.g., show error, rollback optimistic update)
                    }
                } else {
                    console.error("Cannot send message: WebSocket is not connected.");
                    // Optional: Show feedback to the user that they are disconnected
                }
            },
            [
                newMessage,
                userId,
                //   queryClient
            ],
        ), // Include queryClient if doing optimistic updates
        newMessage,
        setNewMessage,
    };
};
