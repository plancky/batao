import { getRandomElement } from "@/Game/utils";
import type { GameSession } from "@/GameSession/types";
import type { Player } from "@/Player/Player";
import type { WordClientAction } from "@/types/client-msgs";
import { ClientActionTypes } from "@/types/constants";

export type letterObj = {
    index: number;
    letter: string | null | undefined;
};

export type WordObj = { [key: number]: letterObj };

export class Word {
    word!: string;
    wordObj!: WordObj;
    guessWordObj!: WordObj;

    constructor(word: string) {
        this.word = word;
        this.wordObj = this.getWordObj(word);
        this.getEmptyWordObj();
    }

    getWordObj(word: string) {
        const arr = Array.from(word);
        const obj = arr.reduce((o, l, i) => ({ ...o, [i]: { index: i, letter: l } }), {});
        return obj;
    }

    getEmptyWordObj() {
        this.guessWordObj = Object.values(this.wordObj).reduce(
            (o, obj, i) => ({
                ...o,
                [i]: { ...obj, letter: [" ", "-"].includes(obj.letter!) ? obj.letter : null },
            }),
            {},
        );
    }

    addLetter() {
        const nullLetterIndices = Object.values(this.guessWordObj)
            .filter((e) => e.letter === null)
            .map((e) => e.index);

        const i = getRandomElement(nullLetterIndices);
        if (i && this.wordObj[i]) {
            this.guessWordObj = { ...this.guessWordObj, [i]: this.wordObj[i] };
        }
    }

    cleanup() {
        this.guessWordObj = {};
    }

    broadcastWordObj(session: GameSession, player: Player) {
        player.sendMsg({
            type: ClientActionTypes.WORD,
            payload: {
                word: Object.values(this.wordObj),
            },
        } as WordClientAction);
    }

    broadcastGuessWordObj(session: GameSession, exclude_players?: Set<Player>) {
        session.broadcastMessageToAllPlayers(
            {
                type: ClientActionTypes.WORD,
                payload: { word: Object.values(this.guessWordObj) },
            } as WordClientAction,
            exclude_players,
        );
    }

    /**
     *
     * @param guess the input compared against this.word
     * @returns 1 for full match, 0 for close match, -1 for no-match.
     */
    compare(guess: string) {
        if (Math.abs(this.word.length - guess.length) > 4) {
            return -1;
        }
        const ld = this.levenshteinDistance(this.word, guess);
        if (ld == 0) {
            return 1;
        } else if (ld <= 2) {
            return 0;
        } else return -1;
    }

    levenshteinDistance(a: string, b: string): number {
        const matrix: number[][] = Array(a.length + 1)
            .fill(null)
            .map(() => Array(b.length + 1).fill(0));

        for (let i = 0; i <= a.length; i++) {
            matrix[i]![0] = i;
        }
        for (let j = 0; j <= b.length; j++) {
            matrix[0]![j] = j;
        }

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i]![j] = Math.min(
                    matrix[i - 1]![j]! + 1, // Deletion
                    matrix[i]![j - 1]! + 1, // Insertion
                    matrix[i - 1]![j - 1]! + cost, // Substitution
                );
            }
        }

        return matrix[a.length]![b.length]!;
    }
}
