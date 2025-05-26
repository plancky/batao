import { type MessageDataTypes } from "./types";

export type MessageData = {
    type: MessageDataTypes;
    [key: string]: any;
};
