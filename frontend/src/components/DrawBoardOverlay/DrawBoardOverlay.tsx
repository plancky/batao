import { GameSettingsOverlay } from "./GameSettingsOverlay";
import { TurnResultOverlay } from "./TurnResultOverlay";
import { WordSelOverlay } from "./WordSelOverlay";

export function DrawBoardOverlay() {
    return (
        <>
            <GameSettingsOverlay />
            <WordSelOverlay />
            <TurnResultOverlay />
        </>
    );
}

interface Props extends React.HTMLAttributes<HTMLElement> {
    show?: boolean;
}

export function DrawBoardOverlayContainer({ show, children }: Props) {
    return (
        <div
            className={`absolute inset-0 z-10 h-full w-full backdrop-blur-2xl ${show ? "flex" : "hidden"}`}
        >
            {children}
        </div>
    );
}
