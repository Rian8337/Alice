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

    /**
     * Creates an array with specific length that's prefilled with an initial value.
     * 
     * @param length The length of the array.
     * @param initialValue The initial value of each array value.
     */
    static initializeArray<T>(length: number, initialValue?: T): T[]  {
        const array: T[] = [];

        if (initialValue !== undefined) {
            for (let i = 0; i < length; ++i) {
                if (Array.isArray(initialValue)) {
                    array.push(JSON.parse(JSON.stringify(initialValue)));
                } else {
                    array.push(initialValue);
                }
            }
        }

        return array;
    }
}