import { RefObject, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import { MESSAGES_QUERY_KEY } from "../components/ChatBoard/constants";
import { ChatMessage } from "../components/ChatBoard/types";
import { connectWebSocket } from "../lib/gsMessageHandler";

export const Route = createFileRoute("/room/$sessionId")({
    component: GameSessionHome,
});

function GameSessionHome() {
    const { sessionId } = Route.useParams();
    const ws = useRef<WebSocket | null>(null); // Ref to hold the WebSocket instance
    const queryClient = useQueryClient(); // Get QueryClient instance
    const { messages, isConnected } = useReactQuerySubscription(sessionId, ws, queryClient);
    return (
        <div className="min-h-screen xl:max-h-screen py-10 grid xl:gap-5 h-full grid-cols-1 xl:game-session-layout-xl text-white">
            {sessionId}
            {/*
            <MainArea />
            <ChatBoard />
             */}
        </div>
    );
}

export const useReactQuerySubscription = (
    sessionId: string,
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
            ws.current = connectWebSocket(queryClient, sessionId, setIsConnected);
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
