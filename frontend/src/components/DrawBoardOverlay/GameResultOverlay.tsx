import { SessionStates } from "$/session/constants";

import { usePlayerStates, useSessionState, useUserInfo } from "@/lib/hooks";

import { useWS } from "../ws-provider";
import { DrawBoardOverlayContainer } from "./DrawBoardOverlay";

export function FinalResultOverlay() {
    const {
        ws: { raw: ws, addMessageEventListener, sendMessage },
        isConnected,
    } = useWS();

    const sessionState = useSessionState();
    const { data: players } = usePlayerStates();
    const show = sessionState === SessionStates.ENDED;

    const sortedScoreArr = Object.values(players).sort((a, b) => +(b.score > a.score));

    return (
        <>
            <DrawBoardOverlayContainer show={show}>
                <div className="text-secondary-foreground bg-secondary/80 flex h-full w-full flex-col items-center p-10">
                    <table className="table-auto [&_:is(th,td)[align=right]]:text-right [&_:is(th,td)[align=left]]:text-left">
                        <thead>
                            <tr>
                                <th align="left" className="min-w-20">{``}</th>
                                <th align="left" className="min-w-40">{`Name`}</th>
                                <th>{`Score`}</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {sortedScoreArr.map((player, index) => (
                                <tr key={`line_${index}`} className="">
                                    <td align="left">{index+1}</td>
                                    <td align="left">{player.name}</td>
                                    <td>{player.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DrawBoardOverlayContainer>
        </>
    );
}
