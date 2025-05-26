import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PlayerState } from "$/server-types/player";

import { usePlayerInfos } from "@/lib/hooks";

import { useWS } from "../ws-provider";
import { PlayerCard } from "./PlayerCard";

export function PlayersPanel() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const { data: players = [] } = usePlayerInfos();

    useEffect(() => {
        console.log("Players....", players);
    }, [players]);

    return (
        <ul className="flex flex-col gap-2">
            {Array.from(players)?.map((player) => {
                return (
                    <PlayerCard
                        key={player.id}
                        id={player.id}
                        name={player.name}
                        _score={player.score}
                        _isOwner={player.isOwner}
                        _isArtist={false}
                    />
                );
            })}
        </ul>
    );
}
