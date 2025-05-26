export function getRandomElement<T>(arr: Array<T>) { 
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex]!;
}
