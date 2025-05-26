import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload } from "@/types/chat";
import type { CanvasClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants/constants";

import { GameStates } from "../../types/constants/game-constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";
import { Draw } from "./Draw";
import { GameState } from "./State";

export class WordSel extends GameState {
    state = GameStates.WORD_SEL;

    constructor(game: Game, turn: Turn) {
        super(game);
        this.turn = turn;
    }

    handleCanvasAction(player: Player, payload: CanvasActionPayload): void {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CANVAS_ACTION,
            payload: payload,
        } as CanvasClientAction);
    }

    handleChatMessage(player: Player, payload: ChatInputPayload): void {
        console.log(payload);
    }

    next(): GameState {
        return new Draw(this.game, this.turn);
    }
}
