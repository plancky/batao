import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";
import { PlayerMetadata } from "$/server-types/player";

import { GAME_STATE_QK, PLAYERS_INFO_QK_NS, SESSION_STATE_QK } from "../constants/query_keys";

export function gameStateUpdateListener(data: ClientAction, queryClient: QueryClient) {
    const { type, payload } = data;
    switch (type) {
        case ClientActionTypes.SESSION_STATE_UPDATE:
            const { state } = payload;
            queryClient.setQueryData(SESSION_STATE_QK, (oldData: string) => {
                return state;
            });
            break;

        case ClientActionTypes.GAME_STATE_UPDATE: {
            const { state } = payload;
            queryClient.setQueryData(GAME_STATE_QK, (oldData: string) => {
                return state;
            });
            break;
        }

        default:
            break;
    }
}
