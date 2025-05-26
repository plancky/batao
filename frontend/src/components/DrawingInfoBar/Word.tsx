import { useEffect, useRef, useState } from "react";

import { ClientAction, letterObj } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";

import { useWS } from "../ws-provider";

export default function Word() {
    const [loArr, setLoArr] = useState<letterObj[]>([]);
    const ele = useRef<HTMLDivElement | null>(null);
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();
    useEffect(() => {
        addMessageEventListener!((event) => {
            const { type, payload } = JSON.parse(event.data) as ClientAction;
            switch (type) {
                case ClientActionTypes.WORD:
                    const { word } = payload;
                    const arr = word.sort((loa, lob) => +(loa.index > lob.index));
                    setLoArr(arr);
                    break;
                default:
                    break;
            }
        });
    }, [ws, isConnected]);

    return (
        <>
            {loArr.length && (
                <ul className="flex gap-4">
                    {loArr.map((lo, i) => {
                        const { letter } = lo;
                        return <li key={`letter_${i}`}>{letter ?? "_"}</li>;
                    })}
                </ul>
            )}
        </>
    );
}
