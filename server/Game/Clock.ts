import EventEmitter from "node:events";

type Events = {
    tick: [number];
};

type tickCallback = (tick: number) => void | (() => void);

export class Clock extends EventEmitter<Events> {
    // the clock tick reference variable
    private _tick: number = 0;
    // the clock interval reference variable
    private clockIntervalId!: NodeJS.Timeout;

    constructor() {
        super();
    }

    // Clock related methods
    get tick() {
        return this._tick;
    }

    startClock() {
        const interval = setInterval(() => {
            this._tick++;
            this.emit("tick", this._tick);
        }, 1000);
        this.clockIntervalId = interval;
        return interval;
    }

    onTick(callback: tickCallback, endArgs?: [endCallback: tickCallback, timer: number]) {
        let finalCallback: (tick: number) => void;
        const removeListener = () => {
            this.stopClock();
            this.resetClock();
            this.removeListener("tick", finalCallback);
        };

        finalCallback = (tick: number) => {
            callback(tick);
        };

        if (endArgs) {
            const [endCb, timer] = endArgs;
            finalCallback = (tick: number) => {
                callback(tick);
                if (tick >= timer) {
                    removeListener();
                    endCb(tick);
                }
            };
        }
        this.on("tick", finalCallback);

        return removeListener;
    }

    stopClock() {
        clearInterval(this.clockIntervalId);
    }

    resetClock() {
        this._tick = 0;
    }
}
