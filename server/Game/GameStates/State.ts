import type { GameSession } from "@/GameSession/types";
import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { GameStateUpdateClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";

import type { GameStates } from "../constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";

export abstract class GameState {
    state!: GameStates;
    game!: Game;
    session!: GameSession;
    turn!: Turn;

    constructor(game: Game) {
        this.game = game;
        this.session = game.session;
    }

    init(): void {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.GAME_STATE_UPDATE,
            payload: {
                state: this.state,
            },
        } as GameStateUpdateClientAction);
    }

    setTurn(turn: Turn) {
        this.turn = turn;
        console.log("GameState: ", this.turn.pickGuessWords);
    }

    abstract handleCanvasAction(player: Player, payload: CanvasActionPayload): void;
    abstract handleChatMessage(player: Player, data: any): void;

    abstract nextState(): GameState;
}
