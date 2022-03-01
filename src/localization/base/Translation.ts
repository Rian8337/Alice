/**
 * Represents a translation.
 */
export abstract class Translation<T extends Record<keyof T, string>> {
    /**
     * The translated text.
     */
    abstract readonly translations: T;
}
