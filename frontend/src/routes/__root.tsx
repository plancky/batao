import * as React from "react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <>
            {/*

            <div className="p-2 flex gap-2 text-lg">

                <Link
                    to="/"
                    activeProps={{
                        className: "font-bold",
                    }}
                    activeOptions={{ exact: true }}
                >
                    Home
                </Link>{" "}
                <Link
                    to="/about"
                    activeProps={{
                        className: "font-bold",
                    }}
                >
                    About
                </Link>
            </div>
            <hr />
            */}
            <ThemeProvider defaultTheme="dark" storageKey="theme">
                <Toaster />
                <Outlet />
            </ThemeProvider>
            <ReactQueryDevtools />
            <TanStackRouterDevtools position="bottom-left" />
        </>
    );
}
