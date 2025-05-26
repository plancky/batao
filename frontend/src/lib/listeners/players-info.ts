import { QueryClient } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";
import { PlayerMetadata } from "$/server-types/player";

import { PLAYERS_INFO_QK_NS } from "../constants/query_keys";
import { useEssentialUserInfo, useUserInfo } from "../hooks";

export function playersInfoUpdateListener(data: ClientAction, queryClient: QueryClient) {
    switch (data.type) {
        case ClientActionTypes.PLAYERS_INITIAL_INFO_UPDATE:
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_INFO_QK_NS], (oldData: PlayerMetadata[] = []) => {
                return payload.players;
            });

            payload?.players?.forEach((player) => {
                queryClient.setQueryData(
                    [PLAYERS_INFO_QK_NS, player.id],
                    (oldData: PlayerMetadata) => {
                        return player;
                    },
                );
            });
            break;

        case ClientActionTypes.PLAYER_JOINED: {
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_INFO_QK_NS], (oldData: PlayerMetadata[] = []) => {
                if (!oldData.some((player) => player.id === payload.id))
                    return [...oldData, payload];
            });
            break;
        }

        case ClientActionTypes.PLAYER_LEFT: {
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_INFO_QK_NS], (oldData: PlayerMetadata[] = []) => {
                const players = oldData.filter((player) => player.id !== payload.id);
                return players;
            });

            queryClient.setQueryData(
                [PLAYERS_INFO_QK_NS, payload.id],
                (oldData: PlayerMetadata) => {
                    return { oldData, ...payload };
                },
            );
            break;
        }

        case ClientActionTypes.PLAYER_OWNER_CHANGED: {
            const { payload } = data;
            queryClient.setQueryData([PLAYERS_INFO_QK_NS], (oldData: PlayerMetadata[] = []) => {
                const newowner = oldData.find((player) => player.id === payload.id);
                if (newowner) newowner.isOwner = true;
                return oldData;
            });
            break;
        }
        case ClientActionTypes.PLAYER_IS_OWNER: {
            const { payload } = data;
            const { id } = payload;

            queryClient.setQueryData([PLAYERS_INFO_QK_NS, id], (oldData: PlayerMetadata) => {
                return { ...oldData, ...payload };
            });
        }
        default:
            break;
    }
}
