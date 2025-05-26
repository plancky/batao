import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import ChatBoard from "../components/ChatBoard/ChatBoard";
import DrawBoard from "../components/DrawBoard/DrawBoard";
import MainArea from "../components/MainArea";

export const Route = createFileRoute("/")({
    component: GameSessionHome,
});

function GameSessionHome() {
    return (
        <div className="min-h-screen xl:max-h-screen py-10 grid xl:gap-5 h-full grid-cols-1 xl:game-session-layout-xl">
            <MainArea />
            <ChatBoard />
            {/*
             */}
        </div>
    );
}
