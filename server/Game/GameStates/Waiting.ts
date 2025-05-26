import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload } from "@/types/chat";
import type { CanvasClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";

import { GameStates } from "../constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";
import { GameState } from "./State";
import { WordSel } from "./WordSel";

export class Waiting extends GameState {
    state = GameStates.WAITING;
    constructor(game: Game) {
        super(game);
    }

    setTurn(turn: Turn): void {
        super.setTurn(turn);
    }

    handleCanvasAction(player: Player, payload: CanvasActionPayload): void {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.CANVAS_ACTION,
            payload: payload,
        } as CanvasClientAction);
    }

    handleChatMessage(player: Player, payload: ChatInputPayload): void {
        console.log(this.state, payload);
    }

    nextState(): GameState {
        return new WordSel(this.game, this.turn);
    }
}
