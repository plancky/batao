import { useEffect, useRef, useState } from "react";

import { ClientAction } from "$/server-types/client-msgs";
import { ClientActionTypes } from "$/server-types/constants";

import Clock from "../icons/clock.svg?react";
import { useWS } from "../ws-provider";

export default function Timer() {
    const [timer, setTimer] = useState(0);
    const ele = useRef<HTMLDivElement | null>(null);
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    useEffect(() => {
        addMessageEventListener!((event) => {
            const { type, payload } = JSON.parse(event.data) as ClientAction;
            switch (type) {
                case ClientActionTypes.CLOCK_UPDATE:
                    setTimer(payload.value);
                    break;

                default:
                    break;
            }
        });
    }, [ws]);

    useEffect(() => {
        ele.current?.style.setProperty("--start-seconds", `${timer}`);
    }, [timer]);

    return (
        <div ref={ele} className="flex gap-1">
            <Clock />
            {timer !== 0 ? <span id="timerValue">{timer}</span> : null}
        </div>
    );
}
