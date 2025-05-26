import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";
import { GameStates } from "$/server-types/game-constants";
import { TurnResultObj } from "$/server-types/game-state";

import { GAME_STATE_QK, SESSION_STATE_QK, TURN_RESULTS_QK } from "../constants/query_keys";

export function gameStateUpdateListener(data: ClientAction, queryClient: QueryClient) {
    const { type, payload } = data;
    switch (type) {
        case ClientActionTypes.SESSION_STATE_UPDATE: {
            const { state } = payload;
            queryClient.setQueryData(SESSION_STATE_QK, (oldData: string) => {
                return state;
            });
            break;
        }

        case ClientActionTypes.GAME_STATE_UPDATE: {
            const { state } = payload;
            queryClient.setQueryData(GAME_STATE_QK, (oldData: string) => {
                return state;
            });
            if (state == GameStates.RESULT) {
                const { result } = payload;
                queryClient.setQueryData(TURN_RESULTS_QK, (oldData: TurnResultObj[]) => {
                    return result;
                });
            }
            break;
        }

        default:
            break;
    }
}
