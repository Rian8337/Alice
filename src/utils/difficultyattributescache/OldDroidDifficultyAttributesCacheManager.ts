import { PPCalculationMethod } from "@alice-enums/utils/PPCalculationMethod";
import { OldDroidDifficultyAttributes } from "@alice-structures/difficultyattributes/OldDroidDifficultyAttributes";
import { Modes } from "@rian8337/osu-base";
import { DifficultyAttributesCacheManager } from "./DifficultyAttributesCacheManager";

/**
 * A cache manager for osu!droid old calculation difficulty attributes.
 */
export class OldDroidDifficultyAttributesCacheManager extends DifficultyAttributesCacheManager<OldDroidDifficultyAttributes> {
    protected override readonly attributeType: PPCalculationMethod =
        PPCalculationMethod.old;
    protected override readonly mode: Modes = Modes.droid;
}
