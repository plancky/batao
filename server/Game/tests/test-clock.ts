import { Clock } from "../Clock";

const clock = new Clock();
let counter = 0;

clock.onTick(
    (tick: number) => {
        console.log("ticking...", tick);
    },
    [
        (tick: number) => {
            console.log("ended", tick);
            afterFirstClock();
        },
        5,
    ],
);

clock.startClock();

const afterFirstClock = () => {
    clock.onTick(
        (tick: number) => {
            console.log("ticking...", tick);
        },
        [
            (tick: number) => {
                ++counter;
                console.log("", counter);
                afterFirstClock();
            },
            3,
        ],
    );
    clock.startClock();
};
