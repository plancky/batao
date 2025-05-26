import type { ChatMessageClass, ChatMessageTypes } from "./constants";

export type ChatMessage = AdminChatMessage | UserChatMessage;

interface AdminChatMessage {
    type: ChatMessageTypes.ADMIN;
    msg: AdminChatMsgObj;
}

interface UserChatMessage {
    type: ChatMessageTypes.USER;
    msg: UserChatMsgObj;
}

interface ChatMsgObj {
    id: string;
    text: string;
    timestamp: string;
}

interface AdminChatMsgObj extends ChatMsgObj {
    cls:
        | ChatMessageClass.ADMIN_GREEN
        | ChatMessageClass.ADMIN_RED
        | ChatMessageClass.ADMIN_YELLOW;
}

interface UserChatMsgObj extends ChatMsgObj {
    cls: ChatMessageClass.USER_MUTED | ChatMessageClass.USER_NORMAL;
    sid: string;
    name: string;
}

// chat input payload
export type ChatInputPayload = {
    text: string;
    timestamp: string;
};
