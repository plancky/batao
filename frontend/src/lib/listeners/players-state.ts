import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";
import { PlayerState } from "$/server-types/player";

import { playerStateKeys, SEL_WORDS_QK } from "../constants/query_keys";
import { AllPlayersStateQueryStore, PlayerStateQueryStore } from "../types/query_store";

function playersArraytoPlayerStateObj(players: PlayerState[]) {
    return players.reduce<AllPlayersStateQueryStore>((obj, p) => ({ ...obj, [p.id]: p }), {});
}

export function playersStateUpdateListener(
    data: ClientAction,
    queryClient: QueryClient,
    userId: string,
) {
    const { payload, type } = data;
    switch (type) {
        case ClientActionTypes.PLAYERS_STATE_UPDATE: {
            const { players } = payload;
            queryClient.setQueryData(playerStateKeys.ALL, (oldData: AllPlayersStateQueryStore) => {
                const newPlayersObj = playersArraytoPlayerStateObj(players);
                return { ...oldData, ...newPlayersObj };
            });

            payload?.players?.forEach((player) => {
                const { id } = player;
                if (id === userId) {
                    queryClient.setQueryData(playerStateKeys.user(), (oldData: PlayerState) => {
                        return player;
                    });
                }
                queryClient.setQueryData(
                    playerStateKeys.player(player.id),
                    (oldData: PlayerState) => {
                        return player;
                    },
                );
            });
            break;
        }

        case ClientActionTypes.WORD_OPTIONS: {
            queryClient.setQueryData(SEL_WORDS_QK, (oldData: string[] = []) => {
                return data?.payload?.words;
            });
            break;
        }
        default:
            break;
    }
}
