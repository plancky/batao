import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload } from "@/types/chat";
import type {
    CanvasClientAction,
    ChatMsgClientAction,
    GameStateUpdateClientAction,
} from "@/types/client-msgs";
import { ChatMessageClass, ChatMessageTypes, ClientActionTypes } from "@/types/constants";

import { GameStates } from "../constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";
import { Result } from "./Result";
import { GameState } from "./State";
import { Waiting } from "./Waiting";

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
                if (text === word) {
                    this.playerHasGuessed(player);
                } else {
                    this.session.broadcastMessageToAllPlayers({
                        type: ClientActionTypes.CHAT_NEW_MESSAGE,
                        payload: player.getChatMessage(text, timestamp, false),
                    } as ChatMsgClientAction);
                }
            } else {
                this.session.broadcastMessage(this.turn.gPlayers, {
                    type: ClientActionTypes.CHAT_NEW_MESSAGE,
                    payload: player.getChatMessage(text, timestamp, true),
                } as ChatMsgClientAction);
            }
        }
    }

    playerHasGuessed(player: Player) {
        this.turn.gPlayers.add(player);
        player.hasGuessed = true;
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

    nextState(): GameState {
        return new Result(this.game, this.turn);
    }
}
