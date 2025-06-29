import path, { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svgr({
            // A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include.
            include: "**/*.svg?react",
        }),
        TanStackRouterVite({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "$/server-types": resolve(__dirname, "../server/types"),
            "$/game": resolve(__dirname, "../server/Game"),
            "$/session": resolve(__dirname, "../server/GameSession"),
        },
    },
    server: {
        proxy: {
            "/gs/connect/": {
                target: "ws://localhost:3000",
                changeOrigin: true,
            },
            "/gs/": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
            "/wsgs": {
                target: "ws://localhost:3000",
                changeOrigin: true,
            },
            "/chat": {
                target: "ws://localhost:3000",
                changeOrigin: true,
            },
        },
    },
});
