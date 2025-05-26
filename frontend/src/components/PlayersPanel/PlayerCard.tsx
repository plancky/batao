import { usePlayerState, useUserState } from "@/lib/hooks";
import Crown from "@/components/icons/crown.svg?react";
import Pencil from "@/components/icons/pencil-line.svg?react";

interface Props extends React.HTMLAttributes<HTMLElement> {
    id: string;
    name: string;
    _isOwner?: boolean;
    _isArtist?: boolean;
    _score?: number;
}
export function PlayerCard({ id, name, _isArtist, _isOwner, _score, ...props }: Props) {
    const {
        data: { isArtist = _isArtist, isOwner = _isOwner, score = _score, hasGuessed = false },
    } = usePlayerState(id);

    return (
        <>
            <li
                {...props}
                className={`${hasGuessed ? "bg-admin-green/70" : "bg-primary/10"} p-2 rounded-(--radius) flex flex-col gap-1`}
            >
                <div className="flex items-center justify-between">
                    <span>{name}</span>
                    {isOwner && (
                        <span className="h-5">
                            <Crown />
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm flex gap-2">
                        <span>points:</span>
                        <span>{score}</span>
                    </div>

                    {isArtist && (
                        <span className="h-5">
                            <Pencil />
                        </span>
                    )}
                </div>
            </li>
        </>
    );
}
