import { getRandomElement } from "@/Game/utils";

export class WordList {
    name!: string;
    path!: string;
    wordList!: string[];

    pickedWords: string[] = [];

    constructor(name: string) {
        this.name = name;
    }

    async readWordlist() {
        const name = this.name;
        this.path = `${import.meta.dir}/wordlists/${name}.json`;
        const file = Bun.file(this.path);
        const contents = await file.json();
        this.wordList = contents;
    }

    /**
     *
     * @param n  number of words to be picked
     * @param customList the list used for picking up numbers
     * @param repetition If words are allowed to be repeated within the same Game
     */
    pickGuessWords(n: number, repetition: boolean = false, customList?: string[]): string[] {
        const wordlist = customList ?? this.wordList;
        const exemptionList = !repetition ? this.pickedWords : [];
        const words: string[] = [];
        for (let i = 0; i < n; i++) {
            const word = this.pickWord(wordlist!, exemptionList)?.toLowerCase();
            words.push(word!);
            this.pickedWords.push(word!);
            wordlist.splice(wordlist.indexOf(word!), 1);
        }
        return words;
    }

    /**
     *
     * @param n  number of words to be picked
     * @param wordsList the list used for picking up numbers
     * @param exemptions re-pick if the word picked is in the exemption list
     */
    pickWord(wordsList: string[], exemptions: string[] = []): string | undefined {
        for (let i = 0; i < 1000000; i++) {
            const word = getRandomElement(wordsList);
            if (!exemptions.includes(word!)) return word;
        }
        throw new Error("Cannot find a new word from the given list.");
    }
}
