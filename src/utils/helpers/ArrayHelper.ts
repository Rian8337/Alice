import { Collection } from "discord.js";

/**
 * Helper methods for arrays.
 */
export abstract class ArrayHelper {
    /**
     * Gets a random element from an array.
     *
     * @param array The array to get the element from.
     * @returns A random element of the array.
     */
    static getRandomArrayElement<T>(array: readonly T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Creates an array with specific length that's prefilled with an initial value.
     *
     * @param length The length of the array.
     * @param initialValue The initial value of each array value.
     */
    static initializeArray<T>(length: number, initialValue?: T): T[] {
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

    /**
     * Converts a collection into an array of `{key, value}` pairs.
     *
     * @param collection The collection.
     * @returns The array from the collection.
     */
    static collectionToArray<K, V>(
        collection: Collection<K, V>,
    ): { key: K; value: V }[] {
        return collection.map((value, key) => {
            return { key, value };
        });
    }

    /**
     * Converts an array into a collection.
     *
     * @param array The array.
     * @param key The key that will be used to map each value in the array.
     * @returns The collection from the array.
     */
    static arrayToCollection<K extends keyof V, V>(
        array: V[],
        key: K,
    ): Collection<V[K], V> {
        const collection: Collection<V[K], V> = new Collection();

        for (const item of array) {
            collection.set(item[key], item);
        }

        return collection;
    }

    /**
     * Removes duplicates from an array.
     *
     * @param array The array.
     * @returns The array with duplicates removed.
     */
    static removeDuplicate<T>(array: T[]): T[] {
        return Array.from(new Set(array));
    }

    /**
     * Shuffles an array.
     *
     * The original array will be modified.
     *
     * This uses Richard Durstenfeld's shuffle algorithm.
     *
     * @param array The array to shuffle.
     */
    static shuffle<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
