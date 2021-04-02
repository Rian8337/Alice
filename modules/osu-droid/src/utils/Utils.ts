/**
 * Some utilities, no biggie.
 */
export abstract class Utils {
    /**
     * Returns a random element of an array.
     * 
     * @param array The array to get the element from.
     */
    static getRandomArrayElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}