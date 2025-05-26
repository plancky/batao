import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { ChatInputPayload } from "@/types/chat";
import type { CanvasClientAction, GameStateUpdateClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";
import type {
    GameStateUpdatePayload,
    TurnResultObj,
    TurnResultStatePayload,
} from "@/types/game-state";

import { GameStates } from "../../types/game-constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";
import { GameState } from "./State";
import { Waiting } from "./Waiting";

export class Result extends GameState {
    state = GameStates.RESULT;

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
        return new Waiting(this.game);
    }
}
