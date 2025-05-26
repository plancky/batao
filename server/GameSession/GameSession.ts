import type { WSContext, WSMessageReceive } from "hono/ws";

import { Game } from "@/Game/Game";
import { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { CanvasClientAction, ClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";
import { randomUUIDv7 } from "bun";

import { SessionStates } from "./constants";
import { GameSession } from "./types";

export class GameSessionImpl extends GameSession {
    constructor() {
        super();
        this.state = SessionStates.WAITING;
        this.sessionId = this.generateSessionId();
        this.players = new Set();

        this.config = {
            rounds: 1,
            turnTime: 60,
        };
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
        this.owner = owner;
    }

    addPlayer(name: string) {
        const player = new Player(this, name, this.players.size == 0);
        if (this.players.size == 0) this.setOwner(player);
        this.players.add(player);

        // attach event handlers
        player.on("PLAYER_JOINED", this.onPlayerJoined.bind(this));
        player.on("PLAYER_LEFT", this.onPlayerLeft.bind(this));
        player.on("CANVAS_ACTION", this.onCanvasAction.bind(this));

        return player;
    }

    onCanvasAction(player: Player, payload: CanvasActionPayload) {
        switch (this.state) {
            case SessionStates.WAITING:
                this.broadcastMessageToAllPlayers({
                    type: ClientActionTypes.CANVAS_ACTION,
                    payload: payload,
                } as CanvasClientAction);
                break;
            /*
            case SessionStates.INGAME:
                this.game.emit("GENERAL_INPUT_WSMSG", player, data);
                break;
            */
            default:
                break;
        }
    }

    deletePlayer(player: Player) {
        if (this.owner == player) {
            const new_owner = this.getNextPlayer(this.owner)!;
            if (new_owner) {
                this.setOwner(this.owner);
                new_owner.makeOwner();
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
    }

    protected onPlayerJoined(player: Player) {
        // Broadcast joining message
        const payload = player.getMetadata();
        this.broadcastMessageToAllPlayers({ type: ClientActionTypes.PLAYER_JOINED, payload });

        {
            const players = [...this.players].map((player) => player.getState());
            const payload = {
                players,
            };

            player.sendMsg({
                type: ClientActionTypes.PLAYERS_INITIAL_STATE_UPDATE,
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

    async start() {
        this.game = new Game(this, this.players);
        this.changeState(SessionStates.INGAME);
        console.log("Starting the game....");
        this.game.start.call(this.game);
        //pre-req: every small action has to happen async, any waiting action cannot be on the stack
        // you might have to keep track of global variables like rounds_done(game-level), active_player(turn-level), already_done_players (round-level)
        // starts the game loop and decides on the first "drawer" player and kicks of the first turn event
        // turn ends and the scores are broadcasted and stored
        // repeats it for all players
        // once done for all players broadcasts roundscores and decides if to repeat it again for the next round.
        // finally decides to stop and broadcasts the final_scores
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

        /*
        console.log(
            "boroadcasting: ",
            messageString,
            "to: ",
            [...players].map((p) => p.getMetadata()),
        );
        */

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
