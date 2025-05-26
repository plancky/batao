import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes, ServerActionTypes } from "$/server-types/constants";
import { ServerAction } from "$/server-types/server-msgs";

import { SEL_WORDS_QK } from "@/lib/constants/query_keys";

import { Button } from "../ui/button";
import { useWS } from "../ws-provider";
import { WordSelOverlay } from "./WordSelOverlay";

export function DrawBoardOverlay() {
    return (
        <>
            <WordSelOverlay />
        </>
    );
}
