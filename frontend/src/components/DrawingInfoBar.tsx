import Clock from "./icons/clock.svg?react";

export default function DrawingInfoBar() {
    return (
        <div className="flex shadow-md rounded-lg justify-between p-10 bg-gray-600 text-white">
            <div>
                <Clock />
            </div>
            <div className=" tracking-[0.5rem]">WORD</div>
        </div>
    );
}
