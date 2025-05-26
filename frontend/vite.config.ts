import { resolve } from "node:path";
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
        alias: [
            { find: "@/server-types", replacement: resolve(__dirname, "../server/types/") },
            { find: "@", replacement: resolve(__dirname, "./src") },
        ],
    },
    server: {
        proxy: {
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
