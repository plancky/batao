import { QueryClient } from "@tanstack/react-query";

import { ClientActionTypes } from "$/server-types/constants";
import { ClientAction } from "$/server-types/client-msgs";
import { PlayerMetadata } from "$/server-types/player";

import { PLAYERS_STATE_KEY_NS } from "../constants/query_keys";

export function playersStateUpdate(data: ClientAction, queryClient: QueryClient) {
    switch (data.type) {
        case ClientActionTypes.PLAYERS_INITIAL_STATE_UPDATE:
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_STATE_KEY_NS], (oldData: any[] = []) => {
                return payload.players;
            });

            payload?.players?.forEach((player) => {
                queryClient.setQueryData(
                    [PLAYERS_STATE_KEY_NS, player.id],
                    (oldData: any[] = []) => {
                        return player;
                    },
                );
            });
            break;

        case ClientActionTypes.PLAYER_JOINED: {
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_STATE_KEY_NS], (oldData: PlayerMetadata[] = []) => {
                if (!oldData.some((player) => player.id === payload.id))
                    return [...oldData, payload];
            });
            break;
        }

        case ClientActionTypes.PLAYER_LEFT: {
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_STATE_KEY_NS], (oldData: PlayerMetadata[] = []) => {
                const players = oldData.filter((player) => player.id !== payload.id);
                return players;
            });
            break;
        }

        case ClientActionTypes.PLAYER_OWNER_CHANGED: {
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_STATE_KEY_NS], (oldData: PlayerMetadata[] = []) => {
                const newowner = oldData.find((player) => player.id !== payload.id);
                if (newowner) newowner.isOwner = true;
                return oldData;
            });
            break;
        }
        default:
            break;
    }
}
