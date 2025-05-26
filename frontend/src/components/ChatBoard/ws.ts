import { QueryClient } from "@tanstack/react-query";

import { WSMessageTypes } from "@/server-types/constants";
import { MessageData } from "@/server-types/messages";

import { MESSAGES_QUERY_KEY } from "./constants";

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
export function handleWebSocketMessage(queryClient: QueryClient, data: MessageData) {
    switch (data.type) {
        case WSMessageTypes.CHAT_NEW_MESSAGE:
            const { payload } = data;
            // --- Update React Query Cache ---
            // This is the core integration: update the query cache when a WS message arrives.
            queryClient.setQueryData(MESSAGES_QUERY_KEY, (oldData: any[] = []) => {
                // Avoid adding duplicates if server echoes back the sender's message
                // (Requires messages to have a unique ID)
                // if (oldData.some(msg => msg.id === receivedMessage.id)) {
                //     return oldData;
                // }
                return [...oldData, payload];
            });
            break;
        default:
            console.log("Unknown message type:", data.type);
    }
}
