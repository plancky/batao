import Timer from "./Timer";
import Word from "./Word";

export default function DrawingInfoBar() {
    return (
        <div
            className="flex shadow-md rounded-lg justify-between p-5 xl:p-10 bg-primary/15"
        >
            <Timer />
            <Word />
        </div>
    );
}
