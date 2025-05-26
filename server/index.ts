import { Hono } from "hono";
import { env } from "hono/adapter";
import { serveStatic } from "hono/bun";

import { websocket } from "./bunws";
import { config, type ENV } from "./config";
import gs from "./game-server";
import type { Variables } from "./types/variables";

// ...
const config1 = config

const app = new Hono<{ Variables: Variables }>();

app.get("/", (c) => {
    const { APP_URL, NODE_ENV } = env<ENV>(c);
    return c.text(`Hello there!, ${APP_URL!}, ${NODE_ENV}`);
});

app.route("/gs", gs);

app.get("*", serveStatic({ root: "./frontend/dist" }));
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default {
    fetch: app.fetch,
    websocket,
};
