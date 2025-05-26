// essential user info, received on first connection
// included key, id, name
export const USER_INFO_QUERY_KEY = ["user_info"];
// player info/metadata query keys
export const playerInfoKeys = {
    ALL: ["player_info"] as const,
    user: () => [...playerInfoKeys.ALL, "this"] as const,
    player: (id: string) => [...playerInfoKeys.ALL, id] as const,
};
// player state query keys
export const playerStateKeys = {
    ALL: ["player_state"] as const,
    user: () => [...playerStateKeys.ALL, "this"] as const,
    player: (id: string) => [...playerStateKeys.ALL, id] as const,
};

// selection words
export const SEL_WORDS_QK = ["words_sel_list"];
// selection words
export const TURN_RESULTS_QK = ["turn_results"];
// game state
export const GAME_STATE_QK = ["game_state"];
// session state
export const SESSION_STATE_QK = ["session_state"];

// messages cache
export const MESSAGES_QUERY_KEY = ["chat_messages"];
