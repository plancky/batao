import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";

import { PLAYER_STATE_QK, SEL_WORDS_QK, USER_INFO_QUERY_KEY } from "./constants/query_keys";
import { playersInfoUpdateListener } from "./listeners/players-info";
import { PlayerStateQueryStore } from "./types/query_store";

export async function checkSessionExists(sessionId: string) {
    const ws_url = new URL(`/gs/connect/${sessionId}`, window.location.origin);
    await fetch(ws_url, { method: "POST" })
        .then((res) => {
            if (res.status == 404) {
                throw new Error("Session does not exist");
            }
        })
        .catch((e) => {
            throw e;
        });
}
// --- WebSocket Connection ---
export function connectWebSocket(
    queryClient: QueryClient,
    sessionId: string,
    setIsConnected: (x: boolean) => void,
    uname?: string,
    setUserMetaData?: (userData: any) => void,
) {
    console.log("Connecting chatboard to WebSocket server...");

    const ws_url = new URL(`/gs/connect/${sessionId}`, window.location.origin);
    ws_url.protocol = "ws";
    if (uname) ws_url.searchParams.set("uname", uname);
    const socket = new WebSocket(ws_url);

    // DrawingBoard API
    // const drawAPI = new DrawingBoard(document.querySelector("#drawContainer")!);
    // drawAPI.initialize(socket);

    socket.addEventListener("open", (event) => {
        // console.log("Connected");
        setIsConnected(true);
    });

    socket.addEventListener("message", (event) => {
        try {
            // console.debug("Message received:", event.data, typeof event.data);
            const data: ClientAction = JSON.parse(event.data);
            // Chatboard handler: todo: move this to near the chatboard component
            // CBHandleWebsocketMessage(queryClient, data);
            // first connection message
            switch (data.type) {
                case ClientActionTypes.CONNECTED: {
                    queryClient.setQueryData(USER_INFO_QUERY_KEY, (oldData: any = {}) => {
                        return { ...oldData, ...data?.payload };
                    });
                    break;
                }
                default:
                    break;
            }
            // essential listeners
            if (data.type.startsWith("player")) {
                playersInfoUpdateListener(data, queryClient);
            }
        } catch (error) {
            console.error("Failed to parse message or update cache:", error);
        }
    });

    socket.onerror = (error: any) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        throw new Error("Session connection has been broken.");
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
