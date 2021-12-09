import { Mod } from "../../mods/Mod";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";

/**
 * A bare minimal abstract skill for fully custom skill implementations.
 */
export abstract class Skill {
    /**
     * The hitobjects that were processed previously. They can affect the strain values of the following objects.
     *
     * The latest hitobject is at index 0.
     */
    protected readonly previous: DifficultyHitObject[] = [];

    /**
     * Number of previous hitobjects to keep inside the `previous` array.
     */
    protected readonly historyLength: number = 2;

    /**
     * The mods that this skill processes.
     */
    protected readonly mods: Mod[];

    constructor(mods: Mod[]) {
        this.mods = mods;
    }

    processInternal(current: DifficultyHitObject): void {
        while (this.previous.length > this.historyLength) {
            this.previous.pop();
        }

        this.process(current);

        this.previous.unshift(current);
    }

    /**
     * Processes a hitobject.
     *
     * @param current The hitobject to process.
     */
    protected abstract process(current: DifficultyHitObject): void;

    /**
     * Returns the calculated difficulty value representing all hitobjects that have been processed up to this point.
     */
    abstract difficultyValue(): number;
}
