import { EventEmitter, EventEmitterAsyncResource } from "node:events";
import type { WSContext, WSMessageReceive } from "hono/ws";

import { broadcast } from "@/broadcast";
import type { GameSessionImpl } from "@/GameSession/GameSession";
import type { GameSession } from "@/GameSession/types";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload, ChatMessage } from "@/types/chat";
import type {
    CanvasClientAction,
    ChatMsgClientAction,
    ClientAction,
    PlayersStateUpdateClientAction,
} from "@/types/client-msgs";
import {
    ChatMessageClass,
    ChatMessageTypes,
    ClientActionTypes,
    ServerActionTypes,
} from "@/types/constants/constants";
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

    private _score: number = 0;
    private session!: GameSessionImpl;
    private isOwner: boolean = false;

    protected _isArtist: boolean = false;

    protected _hasGuessed: boolean = false;

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

    get score() {
        return this._score;
    }

    set score(val: number) {
        this._score = val;
        this.stateUpdateBroadcast();
    }

    set isArtist(val: boolean) {
        this._isArtist = val;
        this.stateUpdateBroadcast();
    }

    get isArtist() {
        return this._isArtist;
    }

    set hasGuessed(val: boolean) {
        this._hasGuessed = val;
        this.stateUpdateBroadcast();
    }

    get hasGuessed() {
        return this._hasGuessed;
    }

    removeOwner() {
        this.isOwner = false;
    }

    makeOwner() {
        this.isOwner = true;
    }

    getMetadata(): PlayerMetadata {
        const { id, _name: name, _score: score, isOwner, join_time } = this;
        return {
            id,
            name,
            score,
            isOwner,
            join_time,
        };
    }

    getState(): PlayerState {
        const { id, _name: name, _score: score, isArtist, isOwner, hasGuessed } = this;
        return {
            id,
            name,
            score,
            isArtist,
            hasGuessed,
            isOwner,
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

    stateUpdateBroadcast() {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.PLAYERS_STATE_UPDATE,
            payload: {
                players: [this.getState()],
            },
        } as PlayersStateUpdateClientAction);
    }

    sendMsg(data: ClientAction) {
        try {
            if (this?.ws?.readyState == WebSocket.OPEN) this.ws.send(JSON.stringify(data));
        } catch (err) {
            console.debug("Error: sending message to client:", err);
        }
    }

    onOpen(evt: Event, ws: WSContext<Bun.ServerWebSocket<any>>) {
        console.log("connected!");
        this.ws = ws;
        /*
        if (ws.raw) {
            ws.raw.data.id = this.id;
        }
        */

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

        // bun ws context
        //const x = ws.raw?.data.x;
        try {
            // Attempt to parse the message (assuming JSON)
            const data: ServerAction = JSON.parse(message);

            const game = this.session?.game;

            switch (data.type) {
                case ServerActionTypes.START:
                    if (this.isOwner) this.emit("START_GAME", data?.payload);
                    break;
                case ServerActionTypes.SEL_WORD:
                    if (this._isArtist) this.emit("WORD_SELECTED", data?.payload);
                    break;
                case ServerActionTypes.CANVAS_ACTION:
                    if (game) game.emit("CANVAS_ACTION", this, data.payload);
                    else this.handleCanvasAction(data.payload);
                    break;
                case ServerActionTypes.CHAT_INPUT:
                    if (game) game.emit("CHAT_INPUT", this, data.payload);
                    else this.handleChatMessage(data.payload);
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

    handleCanvasAction(payload: CanvasActionPayload): void {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CANVAS_ACTION,
            payload: payload,
        } as CanvasClientAction);
    }

    handleChatMessage(payload: ChatInputPayload): void {
        const { text, timestamp } = payload;

        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CHAT_NEW_MESSAGE,
            payload: this.getChatMessage(text, timestamp, false),
        } as ChatMsgClientAction);
    }
}
