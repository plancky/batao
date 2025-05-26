// --- Fetching / Displaying Messages using React Query ---
// We initialize with an empty array. Updates will come via WebSocket.
// `staleTime: Infinity` ensures react-query doesn't try to refetch this automatically.
// We are manually controlling the cache updates via WebSocket messages.

import { useQuery } from "@tanstack/react-query";

import { ChatMessage } from "$/server-types/chat";
import { essentialUserInfo } from "$/server-types/client-msgs";
import { GameStates } from "$/server-types/game-constants";
import { TurnResultObj } from "$/server-types/game-state";
import { PlayerMetadata, PlayerState } from "$/server-types/player";
import { GameConfig } from "$/server-types/server-msgs";
import { SessionStates } from "$/session/constants";

import {
    GAME_CONFIG_QK,
    GAME_STATE_QK,
    MESSAGES_QUERY_KEY,
    playerInfoKeys,
    playerStateKeys,
    SEL_WORDS_QK,
    SESSION_STATE_QK,
    TURN_RESULTS_QK,
    USER_INFO_QUERY_KEY,
} from "./constants/query_keys";
import { AllPlayersStateQueryStore, PlayerStateQueryStore } from "./types/query_store";

export function useEssentialUserInfo() {
    const { data: user_info = {} as essentialUserInfo } = useQuery({
        queryKey: USER_INFO_QUERY_KEY,
        queryFn: () => ({}) as any,
        staleTime: Infinity,
    });

    return { user_info };
}

export function useUserInfo() {
    const { data: user_info = {} as essentialUserInfo } = useQuery({
        queryKey: USER_INFO_QUERY_KEY,
        queryFn: () => ({}) as any,
        staleTime: Infinity,
    });

    const { data = {} as PlayerMetadata } = useQuery({
        queryKey: playerInfoKeys.player(user_info.id),
        queryFn: () => ({}) as PlayerMetadata,
        staleTime: Infinity,
    });

    return { user_info, ...data };
}

export function usePlayerInfos() {
    const { data = [] as PlayerMetadata[], ...otherProps } = useQuery({
        queryKey: playerInfoKeys.ALL,
        queryFn: () => [],
        staleTime: Infinity,
    });

    return { data, ...otherProps };
}

export function usePlayerStates() {
    const { data = {} as AllPlayersStateQueryStore, ...otherProps } = useQuery({
        queryKey: playerStateKeys.ALL,
        queryFn: () => ({}) as AllPlayersStateQueryStore,
        staleTime: Infinity,
    });

    return { data, ...otherProps };
}

export function useUserState() {
    const { data = {} as PlayerState, ...otherProps } = useQuery({
        queryKey: playerStateKeys.user(),
        queryFn: () => ({}) as PlayerState,
        staleTime: Infinity,
    });

    return { data, ...otherProps };
}

export function usePlayerState(id: string) {
    const { data = {} as PlayerState, ...otherProps } = useQuery({
        queryKey: playerStateKeys.player(id),
        queryFn: () => ({}) as PlayerState,
        staleTime: Infinity,
    });

    return { data, ...otherProps };
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

export function useTurnResult() {
    const { data: result = [] as TurnResultObj[], ...props } = useQuery({
        queryKey: TURN_RESULTS_QK,
        queryFn: () => [] as TurnResultObj[],
        staleTime: Infinity,
    });

    return { result, ...props };
}

export function useGameConfig() {
    const { data: config = {} as GameConfig, ...props } = useQuery({
        queryKey: GAME_CONFIG_QK,
        queryFn: () => ({}) as GameConfig,
        staleTime: Infinity,
    });

    return { config, ...props };
}
