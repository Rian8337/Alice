/**
 * Represents a section of a beatmap.
 */
export class BeatmapSection {
    /**
     * The index of the first `DifficultyHitObject` of this beatmap section.
     */
    readonly firstObjectIndex: number;

    /**
     * The index of the last `DifficultyHitObject` of this beatmap section.
     */
    readonly lastObjectIndex: number;

    /**
     * @param firstObjectIndex The index of the first `DifficultyHitObject` of this beatmap section.
     * @param lastObjectIndex The index of the last `DifficultyHitObject` of this beatmap section.
     */
    constructor(firstObjectIndex: number, lastObjectIndex: number) {
        this.firstObjectIndex = firstObjectIndex;
        this.lastObjectIndex = lastObjectIndex;
    }
}
