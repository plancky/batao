export const enum CanvasActions {
    CANVAS_DRAW = "canvas_draw",
    CANVAS_INITIAL_STATE = "canvas_initial_state",
    CANVAS_SAVE_PATHS = "canvas_save_data",
    CANVAS_CLEAR = "canvas_clear",
}

export const enum ChatMessageTypes {
    USER = "user",
    // USER_GUESSED = "user_guessed",
    ADMIN = "admin",
}

export const enum ChatMessageClass {
    USER_NORMAL = "usr-normal",
    USER_MUTED = "usr-muted",
    ADMIN_GREEN = "admin-green",
    ADMIN_YELLOW = "admin-yellow",
    ADMIN_RED = "admin-red",
}

export const enum ClientActionTypes {
    // admin
    CONNECTED = "connected",
    PLAYERS_INITIAL_INFO_UPDATE = "players_info_update",
    PLAYER_JOINED = "player_joined",
    PLAYER_LEFT = "player_left",
    PLAYER_OWNER_CHANGED = "player_owner_changed",
    PLAYERS_STATE_UPDATE = "players_st_updt",
    PLAYER_IS_OWNER = "player_is_owner",

    // state updates
    SESSION_STATE_UPDATE = "sess_st_updt",
    GAME_STATE_UPDATE = "game_st_updt",
    // Clock
    CLOCK_UPDATE = "clock_update",
    // Canvas
    CANVAS_ACTION = "canvas_action",
    // ChatBoard message types
    CHAT_NEW_MESSAGE = "chat_new_msg",

    WORD_OPTIONS = "word_options",
    WORD = "word_hint",
    TURN_RESULT = "turn_result",
}

export const enum ServerActionTypes {
    // Admin
    START = "admin_start",
    SEL_WORD = "admin_select_word",
    // DRAWBOARD message types
    CANVAS_ACTION = "canvas_action",
    CANVAS_REQ_INITIAL = "canvas_req_initial",
    // ChatBoard message types
    CHAT_INPUT = "chat_input",
}
