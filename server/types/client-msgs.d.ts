import type { GameStates } from "@/types/game-constants";
import type { SessionStates } from "@/GameSession/constants";

import type { CanvasActionPayload } from "./canvas";
import type { ChatMessage } from "./chat";
import { CanvasActions, ClientActionTypes, ServerActionTypes } from "./constants";
import type { PlayerMetadata, PlayerState as PlayerMetadata, PlayerState } from "./player";
import type { GameStateUpdatePayload } from "./game-state";
import type { letterObj } from "../Word/Word";

export type ClientAction =
    | PlayersInfoUpdateClientAction
    | PlayersStateUpdateClientAction
    | GameStateUpdateClientAction
    | SessionStateUpdateClientAction
    | ConnectedClientAction
    | CanvasClientAction
    | PlayerJoinedClientAction
    | PlayerLeftClientAction
    | OwnerChangeClientAction
    | WordOptionsClientAction
    | WordClientAction
    | PlayerIsOwnerClientAction
    | ClockClientAction
    | ChatMsgClientAction;

// Different action types

export type essentialUserInfo = {
    key: string;
    id: string;
    uname: string;
};
export type ConnectedClientAction = {
    type: ClientActionTypes.CONNECTED;
    payload: essentialUserInfo;
};

export type GameStateUpdateClientAction = {
    type: ClientActionTypes.GAME_STATE_UPDATE;
    payload: GameStateUpdatePayload;
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

export type PlayerIsOwnerClientAction = {
    type: ClientActionTypes.PLAYER_IS_OWNER;
    payload: PlayerMetadata;
};

export type WordOptionsClientAction = {
    type: ClientActionTypes.WORD_OPTIONS;
    payload: {
        words: string[];
    };
};

export type letterObj = letterObj;

export type WordClientAction = {
    type: ClientActionTypes.WORD;
    payload: {
        word: letterObj[];
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

interface PlayersInfoUpdatePayload {
    players: PlayerMetadata[];
}

export type PlayersInfoUpdateClientAction = {
    type: ClientActionTypes.PLAYERS_INITIAL_INFO_UPDATE;
    payload: PlayersInfoUpdatePayload;
};

interface PlayersStateUpdatePayload {
    players: PlayerState[];
}

export type PlayersStateUpdateClientAction = {
    type: ClientActionTypes.PLAYERS_STATE_UPDATE;
    payload: PlayersStateUpdatePayload;
};
