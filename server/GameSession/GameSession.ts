import type { WSContext, WSMessageReceive } from "hono/ws";

import { Game } from "@/Game/Game";
import { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type {
    CanvasClientAction,
    ChatMsgClientAction,
    ClientAction,
    PlayerIsOwnerClientAction,
    PlayersStateUpdateClientAction,
} from "@/types/client-msgs";
import { ChatMessageClass, ChatMessageTypes, ClientActionTypes } from "@/types/constants/constants";
import type { GameConfig } from "@/types/server-msgs";
import { randomUUIDv7 } from "bun";

import { SessionStates } from "./constants";
import { GameSession } from "./types";

export class GameSessionImpl extends GameSession {
    constructor() {
        super();
        this.state = SessionStates.WAITING;
        this.sessionId = this.generateSessionId();
        this.players = new Set();
    }

    generateSessionId() {
        return randomUUIDv7("base64url");
    }

    changeState(state: SessionStates) {
        this.broadcastMessageToAllPlayers({
            type: ClientActionTypes.SESSION_STATE_UPDATE,
            payload: {
                state,
            },
        } as ClientAction);
        this.state = state;
    }

    // owner related methods
    setOwnerById(id: string) {
        const new_owner = this.findPlayerById(id);
        const old_owner = this.owner;
        if (new_owner) {
            old_owner.removeOwner();
            new_owner?.makeOwner();
            this.setOwner(new_owner);
        }
    }

    protected setOwner(owner: Player) {
        owner.on("START_GAME", this.start.bind(this));
        this.broadcastMessageToAllPlayers({
            type: ClientActionTypes.PLAYER_OWNER_CHANGED,
            payload: owner.getMetadata(),
        });
        owner?.sendMsg({
            type: ClientActionTypes.PLAYER_IS_OWNER,
            payload: owner.getMetadata(),
        } as PlayerIsOwnerClientAction);
        this.owner = owner;
    }

    addPlayer(name: string) {
        const player = new Player(this, name, this.players.size == 0);
        if (this.players.size == 0) this.setOwner(player);
        this.players.add(player);

        // attach event handlers
        player.on("PLAYER_JOINED", this.onPlayerJoined.bind(this));
        player.on("PLAYER_LEFT", this.onPlayerLeft.bind(this));

        return player;
    }

    deletePlayer(player: Player) {
        if (this.owner == player) {
            const new_owner = this.getNextPlayer(this.owner)!;
            if (new_owner) {
                new_owner.makeOwner();
                this.setOwner(new_owner);
            }
        }
        this.players.delete(player);
    }

    protected onPlayerLeft(player: Player) {
        this.deletePlayer(player);
        this.broadcastMessageToAllPlayers({
            type: ClientActionTypes.PLAYER_LEFT,
            payload: player.getMetadata(),
        });
        this.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CHAT_NEW_MESSAGE,
            payload: {
                type: ChatMessageTypes.ADMIN,
                msg: {
                    text: `${player.name} left the room`,
                    cls: ChatMessageClass.ADMIN_RED,
                    timestamp: new Date().toISOString(),
                },
            },
        } as ChatMsgClientAction);

        if (this.players.size == 0) {
            this.stop();
        }
    }

    protected onPlayerJoined(player: Player) {
        // Broadcast joining message
        const payload = player.getMetadata();
        this.broadcastMessageToAllPlayers({ type: ClientActionTypes.PLAYER_JOINED, payload });
        this.broadcastPLayerStates(player);
        {
            const players = [...this.players].map((player) => player.getMetadata());
            const payload = {
                players,
            };

            player.sendMsg({
                type: ClientActionTypes.PLAYERS_INITIAL_INFO_UPDATE,
                payload,
            } as ClientAction);
        }
    }

    findPlayerById(id: string) {
        return [...this.players].find((player) => player.id == id);
    }

    getNextPlayer(player: Player) {
        const iterator = this.players.values();
        for (const p of iterator) {
            if (p == player) return iterator.next().value;
        }
    }

    async stop() {
        if (this.game) {
            this.game.clock.stopClock();
        }
    }

    async start(gameConfig: GameConfig) {
        this.game = new Game(this, this.players, gameConfig);
        console.log("Game Config", gameConfig);
        this.changeState(SessionStates.INGAME);
        console.log("Starting the game....");
        await this.game.start.call(this.game);
    }

    broadcastPLayerStates(player: Player) {
        if (player) {
            player.sendMsg({
                type: ClientActionTypes.PLAYERS_STATE_UPDATE,
                payload: {
                    players: this.getPlayerStates(),
                },
            } as PlayersStateUpdateClientAction);
        } else {
            this.broadcastMessageToAllPlayers({
                type: ClientActionTypes.PLAYERS_STATE_UPDATE,
                payload: {
                    players: this.getPlayerStates(),
                },
            } as PlayersStateUpdateClientAction);
        }
    }

    getPlayerStates() {
        return [...this.players].map((p) => p.getState());
    }

    broadcastMessageToAllPlayers(data: any, exempt?: Set<Player> | Player) {
        let players = this.players;
        if (exempt) {
            if (!("size" in exempt)) exempt = new Set([exempt]);
            players = players.difference<Player>(exempt);
        }

        this.broadcastMessage(players, data);
    }

    broadcastMessage(players: Set<Player>, data: any) {
        const messageString = JSON.stringify(data);

        console.log(
            "boroadcasting: ",
            messageString,
            "to: ",
            [...players].map((p) => p.getMetadata().name),
        );

        for (const player of players.values()) {
            if (player.ws.readyState === WebSocket.OPEN) {
                try {
                    player.ws.send(messageString);
                } catch (err) {
                    if (err) {
                        console.error("Error sending message to client:", err);
                        // Handle error, e.g., remove unresponsive client
                        this.players.delete(player);
                    }
                }
            }
        }
    }
}
