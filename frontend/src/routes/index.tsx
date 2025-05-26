import { CreateRoomForm } from "@/components/CreateRoomForm";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="h-full">
                <CreateRoomForm />
        </div>
    );
}

