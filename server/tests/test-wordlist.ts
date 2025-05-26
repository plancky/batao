import { WordList } from "@/Word/WordList";

async function main() {
    const wl = new WordList("astronomy");
    console.time("wordlistParseTime");
    await wl.readWordlist();
    console.timeEnd("wordlistParseTime");
    const words = wl.pickGuessWords(3, true);
    console.log(words)
}

main()