import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants/constants";
import { PlayerMetadata } from "$/server-types/player";

import { playerInfoKeys } from "../constants/query_keys";

export function playersInfoUpdateListener(data: ClientAction, queryClient: QueryClient) {
    const { payload, type } = data;
    switch (type) {
        case ClientActionTypes.PLAYERS_INITIAL_INFO_UPDATE: {
            queryClient.setQueryData(playerInfoKeys.ALL, (oldData: PlayerMetadata[] = []) => {
                return payload.players;
            });

            payload?.players?.forEach((player) => {
                queryClient.setQueryData(
                    playerInfoKeys.player(player.id),
                    (oldData: PlayerMetadata) => {
                        return player;
                    },
                );
            });
            break;
        }

        case ClientActionTypes.PLAYER_JOINED: {
            queryClient.setQueryData(playerInfoKeys.ALL, (oldData: PlayerMetadata[] = []) => {
                if (!oldData.some((player) => player.id === payload.id))
                    return [...oldData, payload];
            });
            break;
        }

        case ClientActionTypes.PLAYER_LEFT: {
            const { id } = payload;
            queryClient.setQueryData(playerInfoKeys.ALL, (oldData: PlayerMetadata[] = []) => {
                const players = oldData.filter((player) => player.id !== id);
                return players;
            });

            queryClient.setQueryData(playerInfoKeys.player(id), (oldData: PlayerMetadata) => {
                return { oldData, ...payload };
            });
            break;
        }

        case ClientActionTypes.PLAYER_OWNER_CHANGED: {
            queryClient.setQueryData(playerInfoKeys.ALL, (oldData: PlayerMetadata[] = []) => {
                const newowner = oldData.find((player) => player.id === payload.id);
                if (newowner) newowner.isOwner = true;
                return oldData;
            });
            break;
        }

        case ClientActionTypes.PLAYER_IS_OWNER: {
            const { id } = payload;
            queryClient.setQueryData(playerInfoKeys.player(id), (oldData: PlayerMetadata) => {
                return { ...oldData, ...payload };
            });
        }
        default:
            break;
    }
}
