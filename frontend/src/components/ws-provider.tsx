import { createContext, RefObject, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ServerAction } from "$/server-types/server-msgs";

import { useReactQuerySubscription, type ConnectUserCallback } from "@/lib/gameServerSubscription";

type WSMethodsProviderProps = {
    children: React.ReactNode;
    sessionId: string;
};

export type SendMessage = (data: ServerAction) => void;
export type AddMessageEventListener = (callback: (event: MessageEvent<any>) => void) => void;

type WSMethodsProviderState = {
    connectUser?: ConnectUserCallback;
    ws: {
        raw?: RefObject<WebSocket | undefined>;
        addMessageEventListener?: AddMessageEventListener;
        sendMessage?: SendMessage;
    };
    isConnected: boolean;
};

const initialState: WSMethodsProviderState = {
    ws: {},
    isConnected: false,
};

const WSMethodsProviderContext = createContext<WSMethodsProviderState>(initialState);

export function WSMethodsProvider({ children, sessionId, ...props }: WSMethodsProviderProps) {
    const ws = useRef<WebSocket | undefined>(undefined); // Ref to hold the WebSocket instance
    const queryClient = useQueryClient(); // Get QueryClient instance
    const { isConnected, connectUser } = useReactQuerySubscription(sessionId, ws, queryClient);
    const value: WSMethodsProviderState = {
        connectUser,
        ws: {
            raw: ws,
            addMessageEventListener: (callback: (event: MessageEvent<any>) => void) =>
                ws.current?.addEventListener("message", callback),
            sendMessage: (data: any) => {
                const messageStr = JSON.stringify(data);
                if (ws.current?.readyState == WebSocket.OPEN) {
                    ws.current.send(messageStr);
                }
            },
        },
        isConnected,
    };

    return (
        <WSMethodsProviderContext.Provider {...props} value={value}>
            {children}
        </WSMethodsProviderContext.Provider>
    );
}

export const useWS = () => {
    const context = useContext(WSMethodsProviderContext);
    if (context === undefined) throw new Error("useWS must be used within a ThemeProvider");
    return context;
};
