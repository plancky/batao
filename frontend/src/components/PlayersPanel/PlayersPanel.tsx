import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PlayerState } from "$/server-types/player";

import { PLAYERS_INFO_QK_NS } from "@/lib/constants/query_keys";
import Crown from "@/components/icons/crown.svg?react";

import { useWS } from "../ws-provider";

export function PlayersPanel() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();
    const queryClient = useQueryClient();
    useEffect(() => {
        if (addMessageEventListener) {
            console.log("attaching handler");
            addMessageEventListener((event) => {});
        }
    }, [ws]);

    const { data: players = [] as PlayerState[] } = useQuery({
        queryKey: [PLAYERS_INFO_QK_NS],
        queryFn: () => [], // Initial data function (returns empty array)
        staleTime: Infinity, // Data is managed manually via WebSocket
    });

    return (
        <ul className="flex flex-col gap-2">
            {players.map((player) => {
                return (
                    <li
                        key={`player_${player.id}`}
                        className="bg-primary/10 p-2 rounded-(--radius) flex flex-col gap-1"
                    >
                        <div className="flex items-center justify-between">
                            <span>{player.name}</span>
                            {player.isOwner && (
                                <span className="h-5">
                                    <Crown />
                                </span>
                            )}
                        </div>
                        <div className="text-sm flex gap-2">
                            <span>points:</span>
                            <span>{player.score}</span>
                        </div>
                        <div>{player.isArtist}</div>
                    </li>
                );
            })}
        </ul>
    );
}
