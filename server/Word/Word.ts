import { getRandomElement } from "@/Game/utils";
import type { GameSession } from "@/GameSession/types";
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

    broadcastWordUpdate(session: GameSession) {
        session.broadcastMessageToAllPlayers({
            type: ClientActionTypes.WORD,
            payload: {
                word: Object.values(this.guessWordObj),
            },
        } as WordClientAction);
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
        if (this.word === guess) return 1;
        else return 0;
    }
}
