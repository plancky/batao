import { PlayerState } from "$/server-types/player";

export type PlayerStateQueryStore = PlayerState;
export type AllPlayersStateQueryStore = {
    [key: string]: PlayerState;
};
