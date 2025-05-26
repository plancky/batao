import { type MessageData } from "@/types/messages";
import { MessageDataTypes } from "@/types/types";

export function wsMessageHandler(this: any, data: MessageData) {
    switch (data.type) {
        case MessageDataTypes.draw:
            const pathObj: any = { ...data };
            delete pathObj.type;
            this.storePathObj(pathObj);
            break;

        case MessageDataTypes.save_canvas_image_data: {
            console.log("Received:", data);
            this.canvasImageData = data.imageData;
            return 1;
        }
        case MessageDataTypes.clear: {
            this.pathObjsArray = [];
            break;
        }
        default:
            break;
    }
    return 0;
}
