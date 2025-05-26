import { ServerAction } from "$/server-types/server-msgs";

// Helper function to send messages over websocket connection
export function sendWebSocketMessage(socket: WebSocket | null, data: ServerAction) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.warn("WebSocket not connected. Message not sent:", data);
    }
}
