import { type WSMessageTypes } from "./constants";

export type MessageData = {
    type: WSMessageTypes;
    [key: string]: any;
};
