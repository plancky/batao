export const enum WSMessageTypes {
    // DRAWBOARD message types
    CANVAS_DRAW = "draw",
    CANVAS_INITIAL_STATE = "canvas_initial_state",
    CANVAS_SAVE_PATHS = "canvas_save_data",
    CANVAS_CLEAR = "canvas_clear",
    // ChatBoard message types
    CHAT_NEW_MESSAGE = "chat_new_msg",
    CHAT_NEW_USER = "chat_new_user",
}
