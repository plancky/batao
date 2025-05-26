import { QueryClient } from "@tanstack/react-query";
import { RefObject, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { connectWebSocket } from "./gsMessageHandler";

export type ConnectUserCallback = ({ uname }: { uname: string }) => void;

export const useReactQuerySubscription = (
    sessionId: string,
    ws: RefObject<WebSocket | undefined>,
    queryClient: QueryClient,
) => {
    const [isConnected, setIsConnected] = useState(false);

    // --- WebSocket Connection Logic ---
    const connectUser = useCallback(
        ({ uname }: { uname: string }) => {
            const handleContentLoaded = () => {
                try {
                    ws.current = connectWebSocket(queryClient, sessionId, setIsConnected, uname);
                } catch (e) {}
            };

            if (document.readyState !== "loading") {
                handleContentLoaded();
            } else {
                document.addEventListener("DOMContentLoaded", handleContentLoaded);
            }

            return () => {
                document.removeEventListener("DOMContentLoaded", handleContentLoaded);
                console.log("Closing WebSocket connection...");
                ws.current?.close();
            };
        },
        [queryClient],
    ); // Re-run effect only if queryClient changes (which it shouldn't often)

    useEffect(() => {
        if (isConnected) toast(`Connected!`);
    }, [isConnected]);

    return { isConnected, connectUser };
};
