import { DifficultyHitObject } from "../../../difficulty/preprocessing/DifficultyHitObject";

/**
 * Contains information about which cursor index hits a hitobject.
 */
export class IndexedHitObject {
    /**
     * The index of the cursor that hits the hitobject.
     */
    cursorIndex: number;

    /**
     * The underlying difficulty hitobject.
     */
    readonly object: DifficultyHitObject;

    /**
     * @param object The underlying difficulty hitobject.
     * @param cursorIndex The index of the cursor that hits the hitobject.
     */
    constructor(object: DifficultyHitObject, cursorIndex: number) {
        this.object = object;
        this.cursorIndex = cursorIndex;
    }
}
