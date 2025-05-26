import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { CreateRoomForm } from "@/components/CreateRoomForm";

export const Route = createFileRoute("/lobby")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <div className="flex flex-col items-center justify-center p-10">
                <CreateRoomForm />
            </div>
        </div>
    );
}
