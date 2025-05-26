import { GameStates } from "$/server-types/constants/game-constants";

import { useGameState, useTurnResult, useWordSelWords } from "@/lib/hooks";

import { Button } from "../ui/button";
import { useWS } from "../ws-provider";
import { DrawBoardOverlayContainer } from "./DrawBoardOverlay";

export function TurnResultOverlay() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const gameState = useGameState();
    const show = gameState === GameStates.RESULT;
    const { result } = useTurnResult();

    return (
        <>
            <DrawBoardOverlayContainer show={show}>
                <div className="flex h-full w-full items-center justify-center">
                    <table className="table-auto">
                        <tbody className="">
                            {result.map((line, index) => (
                                <tr key={`line_${index}`} className="">
                                    <td>{line.name}</td>
                                    <td>{line.deltaPoints}</td>
                                    <td>{line.accuracy ? `${line.accuracy}%` : `--`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DrawBoardOverlayContainer>
        </>
    );
}
