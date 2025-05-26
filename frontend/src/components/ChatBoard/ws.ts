import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ChatMessageClass, ChatMessageTypes, ClientActionTypes } from "$/server-types/constants/constants";

import { MESSAGES_QUERY_KEY } from "@/lib/constants/query_keys";

import { ChatMessage } from "./types";

// --- WebSocket Connection ---
export function connectWebSocket(queryClient: QueryClient, setIsConnected: (x: boolean) => void) {
    console.log("Connecting chatboard to WebSocket server...");

    const ws_url = new URL("/chat", window.location.origin);
    ws_url.protocol = "ws";
    const socket = new WebSocket(ws_url);

    socket.onopen = () => {
        console.log("WebSocket Connected");
        setIsConnected(true);
        // Optional: Send a join message or fetch initial state if needed
        // ws.current.send(JSON.stringify({ type: 'join', user: userId }));
    };

    socket.onmessage = (event: any) => {
        try {
            // console.debug("Message received:", event.data, typeof event.data);
            const data = JSON.parse(event.data);
            handleWebSocketMessage(queryClient, data);
        } catch (error) {
            console.error("Failed to parse message or update cache:", error);
        }
    };

    socket.onerror = (error: any) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        //statusText.textContent = "Connection Error";
    };

    socket.onclose = (event: any) => {
        console.log("WebSocket connection closed:", event.reason || `Code ${event.code}`);
        setIsConnected(false);
        // Optional: Attempt to reconnect after a delay
        // setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    };

    return socket;
}

// --- Handle Incoming WebSocket Messages ---
export function handleWebSocketMessage(queryClient: QueryClient, data: ClientAction) {
    const { payload } = data;
    switch (data.type) {
        case ClientActionTypes.CHAT_NEW_MESSAGE:
            // --- Update React Query Cache ---
            // update the query cache when a WS message arrives.
            queryClient.setQueryData(MESSAGES_QUERY_KEY, (oldData: any[] = []) => {
                return [...oldData, payload];
            });
            break;
        case ClientActionTypes.PLAYER_JOINED: {
            const { payload } = data;
            // --- Update React Query Cache ---
            // update the query cache when a WS message arrives.
            const msg: ChatMessage = {
                type: ChatMessageTypes.ADMIN,
                msg: {
                    id: "temp",
                    cls: ChatMessageClass.ADMIN_GREEN,
                    text: `${payload.name} has joined!`,
                    timestamp: payload.join_time,
                },
            };
            queryClient.setQueryData(MESSAGES_QUERY_KEY, (oldData: any[] = []) => {
                return [...oldData, msg];
            });
            break;
        }
        default:
            // console.log("Unknown message type:", data.type);
            break;
    }
}
