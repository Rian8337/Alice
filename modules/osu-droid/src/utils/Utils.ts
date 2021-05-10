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

    /**
     * Deep copies an instance.
     * 
     * @param instance The instance to deep copy.
     */
    static deepCopy<T>(instance: T): T {
        return Object.assign(
            Object.create(
                Object.getPrototypeOf(instance)
            ),
            JSON.parse(JSON.stringify(instance))
        );
    }
}