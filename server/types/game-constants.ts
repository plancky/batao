export const enum GameEvents {
    GAME_START = "game_start",
    GAME_END = "game_end",
    ROUND_START = "round_start",
    ROUND_END = "round_end",
    PAUSE = "pause",
    TURN_START = "turn_start",
    TURN_END = "turn_end",
}

export const enum GameStates {
    WAITING = "waiting",
    WORD_SEL = "word_sel",
    DRAWING = "drawing",
    RESULT = "result",
    PAUSED = "paused",
}
