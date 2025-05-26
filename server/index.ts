import { Hono } from "hono";

import { websocket } from "./bunws";
import { upgradeChatConnectionHandler } from "./chatRoom/chatRoomWS";
import { upgradeWSGSConnectionHandler } from "./drawBoard/drawBoardWS";

// ...
const app = new Hono();

app.get("/wsgs", upgradeWSGSConnectionHandler);
app.get("/chat", upgradeChatConnectionHandler);

app.get("/api", (c) => {
    console.log("handler");
    return c.text("Hello Hono!");
});

export default {
    fetch: app.fetch,
    websocket,
};
