import React, { FormEvent, Ref, useCallback, useEffect, useState } from "react";
import { RefObject } from "hono/jsx";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import { ServerActionTypes } from "$/server-types/constants";
import { ChatInputServerAction } from "$/server-types/server-msgs";

import { SendMessage } from "../ws-provider";
import { ChatMessage } from "./types";
import { connectWebSocket } from "./ws";
import { MESSAGES_QUERY_KEY } from "@/lib/constants/query_keys";


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

export const useSendMessageCallback = (
    sendMessage: SendMessage,
) => {
    const [newMessage, setNewMessage] = useState("");
    return {
        handleSendChatMessage: useCallback(
            (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault(); // Prevent form submission page reload
                if (newMessage.trim() === "") return; // Don't send empty messages

                const messagePayload = {
                    text: newMessage,
                    timestamp: new Date().toISOString(),
                };

                const data = {
                    type: ServerActionTypes.CHAT_INPUT,
                    payload: messagePayload,
                } as ChatInputServerAction;

                sendMessage(data);

                setNewMessage(""); // Clear input field after sending
            },
            [
                newMessage,
                //   queryClient
            ],
        ), // Include queryClient if doing optimistic updates
        newMessage,
        setNewMessage,
    };
};
