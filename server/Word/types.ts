export const WORD_LIST_NAMES = {
    "amphibians-scientific": "Amphibians (Scientific)",
    "eastern-food": "Food names (eastern)",
    "christmas-food": "Christmas Food",
    astronomy: "Astronomy",
} as const;

export const WORD_LIST_CODES = [
    "amphibians-scientific",
    "eastern-food",
    "astronomy",
    "christmas-food",
] as const;
export const WORD_LIST_LABELS = Object.keys(WORD_LIST_NAMES);

export type WordListCode = keyof typeof WORD_LIST_NAMES;
