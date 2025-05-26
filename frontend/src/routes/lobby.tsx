import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lobby")({
    component: RouteComponent,
});

function RouteComponent() {
    const createRoomCallback = useCallback(async () => {
        const url = new URL("/gs/lobby", location.origin);
        const res = await fetch(url, {
            method: "POST",
        }).then((res) => res.json());
        location.pathname = `/room/${res.id}`;
        console.log(res);
    }, []);
    return (
        <div>
            <div className="flex flex-col p-10 items-center justify-center">
                <button
                    className="p-5 rounded-xl shadow-md bg-primary cursor-pointer text-primary-foreground"
                    onClick={createRoomCallback}
                >
                    Create Room
                </button>
            </div>
        </div>
    );
}
