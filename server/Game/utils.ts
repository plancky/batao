export function getRandomElement(arr: Array<string>) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}
