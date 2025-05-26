import type { Player } from "../Player/Player";

export interface PlayerMetadata {
    id: Player["id"];
    name: Player["name"];
    score: Player["score"];
    isOwner: Player["isOwner"];
    join_time: Player["join_time"];
}

export interface PlayerState {
    id: Player["id"];
    name: Player["name"];
    score: Player["score"];
    isArtist: Player["_isArtist"];
    isOwner: Player["isOwner"];
    hasGuessed: Player["_hasGuessed"];
}

export interface TurnScoreObj {
    [key: string]: TurnPlayerScoreObj;
}

export interface TurnPlayerScoreObj {
    player: Player;
    deltaPoints: number;
    tries: number;
}
