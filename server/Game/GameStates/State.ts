import type { GameSession } from "@/GameSession/types";
import type { Player } from "@/Player/Player";
import type { CanvasActionPayload } from "@/types/canvas";
import type { GameStateUpdateClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";
import type { GameStateUpdatePayload } from "@/types/game-state";

import type { GameStates } from "../../types/game-constants";
import type { Game } from "../Game";
import type { Turn } from "../Turn";

export abstract class GameState {
    state!: GameStates;
    game!: Game;
    session!: GameSession;
    turn!: Turn;

    altPayload!: GameStateUpdatePayload;

    constructor(game: Game) {
        this.game = game;
        this.session = game.session;
    }

    init(): void {
        this.session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.GAME_STATE_UPDATE,
            payload: this.altPayload ?? {
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
