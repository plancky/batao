import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload } from "@/types/chat";
import type {
    CanvasClientAction,
    ChatMsgClientAction,
    GameStateUpdateClientAction,
} from "@/types/client-msgs";
import { ChatMessageClass, ChatMessageTypes, ClientActionTypes } from "@/types/constants";

import { GameStates } from "../../types/game-constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";
import { Result } from "./Result";
import { GameState } from "./State";

export class Draw extends GameState {
    state = GameStates.DRAWING;

    constructor(game: Game, turn: Turn) {
        super(game);
        this.turn = turn;
    }

    handleCanvasAction(player: Player, payload: CanvasActionPayload): void {
        if (player.isArtist)
            this.session.broadcastMessageToAllPlayers({
                type: ClientActionTypes.CANVAS_ACTION,
                payload: payload,
            } as CanvasClientAction);
    }

    handleChatMessage(player: Player, payload: ChatInputPayload): void {
        const { text, timestamp } = payload;
        const word = this.turn.guessWord;
        if (!player.isArtist) {
            if (!player.hasGuessed) {
                this.updateTries(player);
                const cmpFlag = this.turn.wordAPI.compare(text);
                switch (cmpFlag) {
                    case 0:
                        this.isClose(player);
                        this.broadcastMsg(text, timestamp, player);
                        break;
                    case -1:
                        this.broadcastMsg(text, timestamp, player);
                        break;
                    case 1:
                        this.playerHasGuessed(player);
                        break;
                    default:
                        break;
                }
            } else {
                this.session.broadcastMessage(this.turn.gPlayers, {
                    type: ClientActionTypes.CHAT_NEW_MESSAGE,
                    payload: player.getChatMessage(text, timestamp, true),
                } as ChatMsgClientAction);
            }
        }
    }

    updateTries(player: Player) {
        const scores = this.turn.scoresObj;
        const id = player.id;
        if (scores[id]) {
            scores[id].tries += 1;
        } else {
            scores[id] = {
                player: player,
                deltaPoints: 0,
                tries: 1,
            };
        }
    }

    playerHasGuessed(player: Player) {
        this.turn.gPlayers.add(player);
        this.turn.wordAPI.broadcastWordObj(this.session, player)
        player.hasGuessed = true;
        this.turn.EMIT("HAS_GUESSED", player);
        // Broadcast text message to everyone that the word has been guessed by the player
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CHAT_NEW_MESSAGE,
            payload: {
                type: ChatMessageTypes.ADMIN,
                msg: {
                    timestamp: new Date().toISOString(),
                    cls: ChatMessageClass.ADMIN_GREEN,
                    text: `${player.name} has guessed the word!`,
                },
            },
        } as ChatMsgClientAction);
        // Send the Player the Word
        // player.sendMsg({})
    }

    broadcastMsg(text: string, timestamp: string, player: Player) {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CHAT_NEW_MESSAGE,
            payload: player.getChatMessage(text, timestamp, false),
        } as ChatMsgClientAction);
    }

    isClose(player: Player) {
        player.sendMsg({
            type: ClientActionTypes.CHAT_NEW_MESSAGE,
            payload: {
                type: ChatMessageTypes.ADMIN,
                msg: {
                    timestamp: new Date().toISOString(),
                    cls: ChatMessageClass.ADMIN_YELLOW,
                    text: `you are close!`,
                },
            },
        } as ChatMsgClientAction);
    }

    next(): GameState {
        return new Result(this.game, this.turn);
    }
}
