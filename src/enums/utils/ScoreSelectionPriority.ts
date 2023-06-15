/**
 * Specifies the priority when retrieving scores.
 */
export enum ScoreSelectionPriority {
    /**
     * Prioritize recent scores over overwritten scores.
     */
    recent,

    /**
     * Prioritize overwritten scores over recent scores.
     */
    overwritten,
}
