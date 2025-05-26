import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ClientActionTypes } from "$/server-types/constants";
import { ClientAction } from "$/server-types/client-msgs";

import { SEL_WORDS } from "@/lib/constants/query_keys";

import Clock from "./icons/clock.svg?react";
import { useWS } from "./ws-provider";

export default function DrawingInfoBar() {
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
                    console.log(payload.value);
                    //timer.current = payload?.value;
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
        <div
            ref={ele}
            style={{}}
            className="flex shadow-md rounded-lg justify-between p-10 bg-gray-600 text-white"
        >
            <div className=" flex gap-2">
                <Clock />
                {timer !== 0 ? <span id="timerValue">{timer}</span> : null}
            </div>
            <div className=" tracking-[0.5rem]">WORD</div>
        </div>
    );
}
