import DrawBoard from "./DrawBoard/DrawBoard";
import DrawingInfoBar from "./DrawingInfoBar";

export default function MainArea() {
    return (
        <div className="flex flex-col xl:col-[main] gap-8">
            <DrawingInfoBar />
            <DrawBoard />
            {/*
             */}
        </div>
    );
}
