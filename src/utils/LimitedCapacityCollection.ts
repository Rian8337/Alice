import { Collection } from "discord.js";

/**
 * A collection with limited capacity.
 */
export class LimitedCapacityCollection<K, V> extends Collection<K, V> {
    /**
     * The capacity of this limited collection.
     */
    private readonly capacity: number;

    /**
     * @param capacity The capacity of the collection.
     */
    constructor(capacity: number) {
        super();

        this.capacity = capacity;

        if (capacity <= 0) {
            throw new Error(`Invalid limited collection capacity: ${capacity}`);
        }
    }

    /**
     * Adds or updates an element with a specified key and a value to the collection.
     * 
     * If the capacity overfills, the oldest added/updated element will be removed.
     * 
     * @param key The key of the element to add.
     * @param value The value of the element to add.
     * @returns This `LimitedCapacityCollection` object.
     */
    set(key: K, value: V): this {
        while (this.size >= this.capacity) {
            this.delete(this.firstKey()!);
        }

        // Reenter to set lastKey() to this key.
        this.delete(key);

        super.set(key, value);

        return this;
    }
}