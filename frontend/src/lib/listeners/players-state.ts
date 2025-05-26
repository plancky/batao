import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";
import { PlayerMetadata } from "$/server-types/player";

import { PLAYER_STATE_QK, PLAYERS_INFO_QK_NS, SEL_WORDS_QK } from "../constants/query_keys";
import { PlayerStateQueryStore } from "../types/query_store";

export function playersStateUpdateListener(data: ClientAction, queryClient: QueryClient) {
    switch (data.type) {
        case ClientActionTypes.PLAYER_IS_ARTIST: {
            queryClient.setQueryData(PLAYER_STATE_QK, (oldData: PlayerStateQueryStore = {}) => {
                return { ...oldData, isArtist: true };
            });

            queryClient.setQueryData(SEL_WORDS_QK, (oldData: string[] = []) => {
                return data?.payload?.words;
            });
            break;
        }
        default:
            break;
    }
}
