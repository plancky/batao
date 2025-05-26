import { RefObject } from "react";

import AdminPannel from "./AdminPannel";
import DrawBoard from "./DrawBoard/DrawBoard";
import DrawingInfoBar from "./DrawingInfoBar";

interface Props extends React.HTMLAttributes<HTMLElement> {}

export default function MainArea({ ...props }: Props) {
    return (
        <div className="flex flex-col col-[full] xl:col-[main] gap-5" {...props}>
            <DrawingInfoBar />
            <DrawBoard />
            <AdminPannel />
        </div>
    );
}
