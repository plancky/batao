import type { GameStates } from "@/Game/constants";
import type { SessionStates } from "@/GameSession/constants";

import type { CanvasActionPayload } from "./canvas";
import type { ChatMessage } from "./chat";
import { CanvasActions, ClientActionTypes, ServerActionTypes } from "./constants";
import type { PlayerMetadata, PlayerState } from "./player";

export type ClientAction =
    | PlayersStateUpdateClientAction
    | GameStateUpdateClientAction
    | SessionStateUpdateClientAction
    | ConnectedClientAction
    | CanvasClientAction
    | PlayerJoinedClientAction
    | PlayerLeftClientAction
    | OwnerChangeClientAction
    | IsArtistClientAction
    | ClockClientAction
    | ChatMsgClientAction;

// Different action types
export type PlayersStateUpdateClientAction = {
    type: ClientActionTypes.PLAYERS_INITIAL_STATE_UPDATE;
    payload: PlayersStateUpdatePayload;
};

export type ConnectedClientAction = {
    type: ClientActionTypes.CONNECTED;
    payload: {
        key: string;
        id: string;
        uname: string;
    };
};

export type GameStateUpdateClientAction = {
    type: ClientActionTypes.GAME_STATE_UPDATE;
    payload: {
        state: GameStates;
    };
};

export type SessionStateUpdateClientAction = {
    type: ClientActionTypes.SESSION_STATE_UPDATE;
    payload: {
        state: SessionStates;
    };
};

export type PlayerJoinedClientAction = {
    type: ClientActionTypes.PLAYER_JOINED;
    payload: PlayerMetadata;
};

export type PlayerLeftClientAction = {
    type: ClientActionTypes.PLAYER_LEFT;
    payload: PlayerMetadata;
};

export type OwnerChangeClientAction = {
    type: ClientActionTypes.PLAYER_OWNER_CHANGED;
    payload: PlayerMetadata;
};

export type IsArtistClientAction = {
    type: ClientActionTypes.PLAYER_IS_ARTIST;
    payload: {
        words: string[];
    };
};

export type ClockClientAction = {
    type: ClientActionTypes.CLOCK_UPDATE;
    payload: { value: number };
};

export type CanvasClientAction = {
    type: ClientActionTypes.CANVAS_ACTION;
    payload: CanvasActionPayload;
};

export type ChatMsgClientAction = {
    type: ClientActionTypes.CHAT_NEW_MESSAGE;
    payload: ChatMessage;
};

// Payload types
interface PlayersStateUpdatePayload {
    players: PlayerState[];
}
