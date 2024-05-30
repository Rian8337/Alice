import { Collection } from "discord.js";

/**
 * A collection with limited capacity.
 */
export class LimitedCapacityCollection<K, V> extends Collection<K, V> {
    /**
     * The capacity of this collection.
     */
    private readonly capacity: number;

    /**
     * The epoch time at which a cache data is added, in milliseconds.
     */
    private readonly addedTime = new Collection<K, number>();

    /**
     * The interval at which this limited collection will be sweeped, in seconds.
     */
    private readonly sweepInterval = 600;

    /**
     * The lifetime of each cache data in this limited collection.
     */
    private readonly lifetime: number;

    private interval?: NodeJS.Timeout;

    /**
     * @param capacity The capacity of the collection.
     * @param lifetime The lifetime of each cache data in the collection, in seconds.
     */
    constructor(capacity: number, lifetime: number) {
        super();

        this.capacity = capacity;
        this.lifetime = lifetime;

        if (capacity <= 0) {
            throw new Error(`Invalid limited collection capacity: ${capacity}`);
        }

        if (lifetime <= 0) {
            throw new Error(`Invalid limited collection lifetime: ${lifetime}`);
        }
    }

    /**
     * Starts an interval to periodically sweep cache data that
     * were unused for the specified duration.
     */
    private startInterval(): void {
        this.interval ??= setInterval(() => {
            const executionTime = Date.now();

            this.addedTime.forEach((value, key) => {
                if (executionTime - value > this.lifetime * 1000) {
                    this.addedTime.delete(key);
                    this.delete(key);
                }
            });

            if (this.size === 0) {
                clearInterval(this.interval!);
                this.interval = undefined;
            }
        }, this.sweepInterval * 1000);
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
    override set(key: K, value: V): this {
        while (this.size >= this.capacity) {
            this.addedTime.delete(this.firstKey()!);
            this.delete(this.firstKey()!);
        }

        // Reenter to set lastKey() to this key.
        this.delete(key);

        super.set(key, value);

        this.startInterval();

        this.addedTime.set(key, Date.now());

        return this;
    }
}
