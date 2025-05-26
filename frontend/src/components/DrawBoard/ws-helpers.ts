import { type MessageData } from "$/server-types/client-msgs";

// Helper function to send messages over websocket connection
export function sendWebSocketMessage(socket: WebSocket, data: MessageData) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.warn("WebSocket not connected. Message not sent:", data);
    }
}
