/**
 * A cloneable `Accuracy` object.
 */
export interface CloneableAccuracy {
    /**
     * The amount of 300s achieved.
     */
    n300: number;

    /**
     * The amount of 100s achieved.
     */
    n100: number;

    /**
     * The amount of 50s achieved.
     */
    n50: number;

    /**
     * The amount of misses achieved.
     */
    nmiss: number;
}
