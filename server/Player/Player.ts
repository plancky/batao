import { EventEmitter, EventEmitterAsyncResource } from "node:events";
import type { WSContext, WSMessageReceive } from "hono/ws";

import { broadcast } from "@/broadcast";
import type { GameSessionImpl } from "@/GameSession/GameSession";
import type { GameSession } from "@/GameSession/types";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload, ChatMessage } from "@/types/chat";
import type { ChatMsgClientAction, ClientAction } from "@/types/client-msgs";
import {
    ChatMessageClass,
    ChatMessageTypes,
    ClientActionTypes,
    ServerActionTypes,
} from "@/types/constants";
import type { PlayerMetadata, PlayerState } from "@/types/player";
import type { GameConfig, ServerAction } from "@/types/server-msgs";
import { randomUUIDv7 } from "bun";

type Events = {
    PLAYER_JOINED: [Player];
    PLAYER_LEFT: [Player];
    CHAT_INPUT: [Player, ChatInputPayload];
    CANVAS_ACTION: [Player, CanvasActionPayload];
    WORD_SELECTED: [{ word: string }];
    START_GAME: [GameConfig];
};

export class Player extends EventEmitter<Events> {
    ws!: WSContext;
    readonly id!: string;
    readonly key!: string;
    readonly join_time!: string;
    private _name!: string;
    get name() {
        return this._name;
    }

    private score: number = 0;
    private session!: GameSessionImpl;
    private isOwner: boolean = false;

    isArtist: boolean = false;
    hasGuessed: boolean = false;

    constructor(session: GameSessionImpl, name: string, isOwner?: boolean) {
        super();
        this.session = session;
        this._name = name;
        this.id = this.generatePlayerId();
        this.key = randomUUIDv7("base64url");
        this.join_time = new Date().toISOString();

        this.isOwner = isOwner ?? false;

        // attach event handlers, (now attached on GameSession itself)
        // this.on(WSMessageTypes.PLAYER_JOINED, this.session.onPlayerJoined.bind(session));
    }

    protected generatePlayerId() {
        return randomUUIDv7("hex");
    }

    removeOwner() {
        this.isOwner = false;
    }

    makeOwner() {
        this.isOwner = true;
    }

    getMetadata(): PlayerMetadata {
        const { id, _name: name, score, isOwner, join_time } = this;
        return {
            id,
            name,
            score,
            isOwner,
            join_time,
        };
    }

    getChatMessage(text: string, tstmp: string, muted = false) {
        return {
            type: ChatMessageTypes.USER,
            msg: {
                id: randomUUIDv7(),
                text,
                name: this._name,
                sid: this.id,
                timestamp: tstmp,
                cls: muted ? ChatMessageClass.USER_MUTED : ChatMessageClass.USER_NORMAL,
            },
        } as ChatMessage;
    }

    getState(): PlayerState {
        const { id, _name: name, score, isArtist, isOwner } = this;
        return {
            id,
            name,
            score,
            isArtist,
            isOwner,
        };
    }

    sendMsg(data: ClientAction) {
        try {
            this.ws.send(JSON.stringify(data));
        } catch (err) {
            console.error("Error sending message to client:", err);
        }
    }

    onOpen(evt: Event, ws: WSContext<Bun.ServerWebSocket<any>>) {
        console.log("connected!");
        this.ws = ws;
        if (ws.raw) {
            ws.raw.data.x = 1;
        }

        // send the player important credentials confirming its identity
        this.sendMsg({
            type: ClientActionTypes.CONNECTED,
            payload: { key: this.key, id: this.id, uname: this._name },
        });

        // emit event of player joining for the session to take care.
        this.emit("PLAYER_JOINED", this);
    }

    onMessage(evt: MessageEvent<WSMessageReceive>, ws: WSContext<Bun.ServerWebSocket<any>>) {
        const message = evt.data.toString();

        const x = ws.raw?.data.x;
        try {
            // Attempt to parse the message (assuming JSON)
            const data: ServerAction = JSON.parse(message);

            const game = this.session?.game;

            switch (data.type) {
                case ServerActionTypes.START:
                    if (this.isOwner) this.emit("START_GAME", data?.payload);
                    break;
                case ServerActionTypes.SEL_WORD:
                    if (this.isArtist) this.emit("WORD_SELECTED", data?.payload);
                    break;
                case ServerActionTypes.CANVAS_ACTION:
                    if (game) game.emit("CANVAS_ACTION", this, data.payload);
                    else this.emit("CANVAS_ACTION", this, data.payload);
                    break;
                case ServerActionTypes.CHAT_INPUT:
                    console.log(data.payload);
                    if (game) game.emit("CHAT_INPUT", this, data.payload);
                    else this.emit("CHAT_INPUT", this, data.payload);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Failed to parse message or invalid message format:", message, error);
            // Optionally send an error back to the client
            // ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    }
    onClose(evt: CloseEvent, ws: WSContext<Bun.ServerWebSocket<undefined>>) {
        console.log("Connection closed", this.getMetadata());
        this.emit("PLAYER_LEFT", this);
        //this.session.players.delete(ws);
    }
    onError(evt: Event, ws: WSContext<Bun.ServerWebSocket<undefined>>) {}
}
