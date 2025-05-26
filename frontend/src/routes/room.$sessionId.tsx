import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Game } from "@/components/Game";
import { WSMethodsProvider } from "@/components/ws-provider";

import { checkSessionExists, connectWebSocket } from "../lib/gsMessageHandler";

export const Route = createFileRoute("/room/$sessionId")({
    component: GameSessionHome,
});

function GameSessionHome() {
    const { sessionId } = Route.useParams();
    const [sessionExists, setSessionExists] = useState(true);

    useEffect(() => {
        checkSessionExists(sessionId).catch((e) => {
            setSessionExists(false);
        });
    }, []);

    return (
        <>
            {!sessionExists ? (
                <div className="h-full gird place-content-center">
                    <div className="p-10 border-1 border-primary rounded-(--radius) bg-transparent mx-auto w-fit">
                        Session Does not exist!
                    </div>
                </div>
            ) : (
                <WSMethodsProvider sessionId={sessionId}>
                    <Game />
                </WSMethodsProvider>
            )}
        </>
    );
}
