// --- Fetching / Displaying Messages using React Query ---
// We initialize with an empty array. Updates will come via WebSocket.
// `staleTime: Infinity` ensures react-query doesn't try to refetch this automatically.
// We are manually controlling the cache updates via WebSocket messages.

import { useQuery } from "@tanstack/react-query";

import { GameStates } from "$/game/constants";
import { ChatMessage } from "$/server-types/chat";
import { essentialUserInfo } from "$/server-types/client-msgs";
import { PlayerMetadata } from "$/server-types/player";
import { SessionStates } from "$/session/constants";

import {
    GAME_STATE_QK,
    MESSAGES_QUERY_KEY,
    PLAYERS_INFO_QK_NS,
    SEL_WORDS_QK,
    SESSION_STATE_QK,
    USER_INFO_QUERY_KEY,
} from "./constants/query_keys";

export function useEssentialUserInfo() {
    const { data: user_info = {} as essentialUserInfo } = useQuery({
        queryKey: USER_INFO_QUERY_KEY,
        queryFn: () => {},
        staleTime: Infinity,
    });

    return { user_info };
}

export function useUserInfo() {
    const { data: user_info = {} as essentialUserInfo } = useQuery({
        queryKey: USER_INFO_QUERY_KEY,
        queryFn: () => {},
        staleTime: Infinity,
    });

    const { data = {} as PlayerMetadata } = useQuery({
        queryKey: [PLAYERS_INFO_QK_NS, user_info.id],
        queryFn: () => {},
        staleTime: Infinity,
    });

    return { user_info, ...data };
}

export function useChatMessages() {
    const { data: messages = [] as ChatMessage[] } = useQuery({
        queryKey: MESSAGES_QUERY_KEY,
        queryFn: () => [] as ChatMessage[], // Initial data function (returns empty array)
        staleTime: Infinity, // Data is managed manually via WebSocket
    });

    return messages;
}

export function useGameState() {
    const { data: gameState = GameStates.WAITING as GameStates } = useQuery({
        queryKey: GAME_STATE_QK,
        queryFn: () => GameStates.WAITING as GameStates,
        staleTime: Infinity,
    });

    return gameState;
}

export function useSessionState() {
    const { data = SessionStates.WAITING as SessionStates } = useQuery({
        queryKey: SESSION_STATE_QK,
        queryFn: () => SessionStates.WAITING as SessionStates,
        staleTime: Infinity,
    });

    return data;
}

export function useWordSelWords() {
    const { data: words = [] as string[] } = useQuery({
        queryKey: SEL_WORDS_QK,
        queryFn: () => [] as string[],
        staleTime: Infinity,
    });

    return words;
}
