import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { Modes } from "@rian8337/osu-base";
import { DroidDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { DifficultyAttributesCacheManager } from "./DifficultyAttributesCacheManager";

/**
 * A cache manager for osu!droid live calculation difficulty attributes.
 */
export class LiveDroidDifficultyAttributesCacheManager extends DifficultyAttributesCacheManager<DroidDifficultyAttributes> {
    protected override readonly attributeType: PPCalculationMethod =
        PPCalculationMethod.live;
    protected override readonly mode: Modes = Modes.droid;
}
