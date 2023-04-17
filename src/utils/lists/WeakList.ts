/**
 * A list maintaining weak reference of objects.
 */
export class WeakList<T extends object> implements Iterable<T | null> {
    /**
     * The number of items that can be added or removed from this
     * list before the next addition causes the list to be trimmed.
     */
    private static readonly opportunisticTrimThreshold: number = 100;

    private list: (WeakRef<T> | null)[] = [];

    /**
     * The inclusive starting index of the list.
     */
    private listStart: number = 0;

    /**
     * The exclusive ending index of the list.
     */
    private listEnd: number = 0;

    /**
     * The number of items that have been added or removed from this list since it was last trimmed.
     * Upon reaching the trim threshold, this list will be trimmed on the next addition.
     */
    private countChangesSinceTrim: number = 0;

    /**
     * Adds an item to this list. The item is added as a weak reference.
     *
     * @param item The item to add.
     */
    add(item: T): void;

    /**
     * Adds a weak references to this list.
     *
     * @param weakReference The weak reference to add.
     */
    add(weakReference: WeakRef<T>): void;

    add(item: T | WeakRef<T>) {
        this.addInternal(item instanceof WeakRef ? item : new WeakRef(item));
    }

    private addInternal(item: WeakRef<T>): void {
        if (this.countChangesSinceTrim > WeakList.opportunisticTrimThreshold) {
            this.trim();
        }

        if (this.listEnd < this.list.length) {
            this.list[this.listEnd] = item;
            --this.countChangesSinceTrim;
        } else {
            this.list.push(item);
            ++this.countChangesSinceTrim;
        }

        ++this.listEnd;
    }

    /**
     * Removes an item from this list.
     *
     * @param item The item to remove.
     * @returns Whether the item was removed.
     */
    remove(item: T): boolean;

    /**
     * Removes a weak reference from this list.
     *
     * @param weakReference The weak reference to remove.
     * @returns Whether the weak reference was removed.
     */
    remove(weakReference: WeakRef<T>): boolean;

    remove(item: T | WeakRef<T>): boolean {
        for (let i = this.listStart; i < this.listEnd; ++i) {
            const reference: WeakRef<T> | null = this.list[i];

            // Check if the object is valid.
            if (!reference) {
                continue;
            }

            if (item instanceof WeakRef && reference !== item) {
                continue;
            }

            if (reference.deref() !== item) {
                continue;
            }

            this.removeAt(i - this.listStart);
            return true;
        }

        return false;
    }

    /**
     * Removes an item at an index from this list.
     *
     * @param index The index to remove at.
     */
    removeAt(index: number): void {
        // Move the index to the valid range of the list.
        index += this.listStart;

        if (index < this.listStart || index >= this.listEnd) {
            throw new RangeError("Index out of range");
        }

        this.list[index] = null;

        if (index === this.listStart) {
            ++this.listStart;
        } else if (index === this.listEnd - 1) {
            --this.listEnd;
        }

        ++this.countChangesSinceTrim;
    }

    /**
     * Searches for an item in this list.
     *
     * @param item The item to search for.
     * @returns Whether the item is alive and in this list.
     */
    contains(item: T): boolean;

    /**
     * Searches for a weak reference in this list.
     *
     * @param weakReference The weak reference to search for.
     * @returns Whether the weak reference is in this list.
     */
    contains(weakReference: WeakRef<T>): boolean;

    contains(item: T | WeakRef<T>): boolean {
        for (let i = this.listStart; i < this.listEnd; ++i) {
            const reference: WeakRef<T> | null = this.list[i];

            // Check if the object is valid.
            if (!reference) {
                continue;
            }

            if (item instanceof WeakRef && reference !== item) {
                continue;
            }

            if (reference.deref() !== item) {
                continue;
            }

            return true;
        }

        return false;
    }

    /**
     * Clears all items from this list.
     */
    clear(): void {
        this.listStart = this.listEnd = 0;
        this.countChangesSinceTrim = this.list.length;
    }

    *[Symbol.iterator]() {
        this.trim();

        let counter: number = 0;

        while (counter < this.list.length) {
            yield this.list[counter++]?.deref() ?? null;
        }
    }

    private trim(): void {
        // Trim from the sides - items that have been removed.
        this.list.splice(this.listEnd, this.list.length - this.listEnd);
        this.list.splice(0, this.listStart);

        // Trim all items whose references are no longer alive.
        this.list = this.list.filter((item) => item?.deref() !== undefined);

        // After the trim, the valid range represents the full list.
        this.listStart = 0;
        this.listEnd = this.list.length;
        this.countChangesSinceTrim = 0;
    }
}
