import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="theme">
                <Toaster />
                <Outlet />
            </ThemeProvider>
            <ReactQueryDevtools />
            <TanStackRouterDevtools position="bottom-left" />
        </>
    );
}
