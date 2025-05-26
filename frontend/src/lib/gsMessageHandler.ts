import { QueryClient } from "@tanstack/react-query";

// --- WebSocket Connection ---
export function connectWebSocket(
    queryClient: QueryClient,
    sessionId: string,
    setIsConnected: (x: boolean) => void,
) {
    console.log("Connecting chatboard to WebSocket server...");

    const ws_url = new URL(`/gs/connect/${sessionId}`, window.location.origin);
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
            console.debug("Message received:", event.data, typeof event.data);
            const data = JSON.parse(event.data);
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
