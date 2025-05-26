import { Hono } from "hono";
import { env } from "hono/adapter";
import { serveStatic } from "hono/bun";
import { HTTPException } from "hono/http-exception";


import { websocket } from "./bunws";
import { config, type ENV } from "./config";
import gs from "./game-server";
import type { Variables } from "./types/variables";
import type { ErrorResponse } from "./types/server-msgs";

// ...
const config1 = config;

const app = new Hono<{ Variables: Variables }>();

app.get("/server", (c) => {
    const { APP_URL, NODE_ENV } = env<ENV>(c);
    return c.text(`Hello there!, ${APP_URL!}, ${NODE_ENV}`);
});

app.route("/gs", gs);

app.onError((err, c) => {
    if (err instanceof HTTPException) {
        const errResponse =
            err.res ??
            c.json<ErrorResponse>(
                {
                    success: false,
                    error: err.message,
                    isFormError:
                        err.cause && typeof err.cause === "object" && "form" in err.cause
                            ? err.cause.form === true
                            : false,
                },
                err.status,
            );
        return errResponse;
    }

    return c.json<ErrorResponse>(
        {
            success: false,
            error:
                process.env.NODE_ENV === "production"
                    ? "Interal Server Error"
                    : (err.stack ?? err.message),
        },
        500,
    );
});

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default {
    port: process.env["PORT"] || 3000,
    hostname: "0.0.0.0",
    fetch: app.fetch,
    websocket,
};

console.log("Server Running on port", process.env["PORT"] || 3000);
export type ApiRoutes = typeof app;
