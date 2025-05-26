import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PlayerState } from "$/server-types/player";

import { PLAYERS_STATE_KEY_NS } from "@/lib/constants/query_keys";

import { PlayersPanel } from "./PlayersPanel/PlayersPanel";
import { useWS } from "./ws-provider";

export function LeftSidebar() {
    return (
        <div className="h-full ">
            <PlayersPanel />
        </div>
    );
}
