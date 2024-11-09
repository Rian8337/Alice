import { SliderTickInformation } from "@structures/pp/SliderTickInformation";
import { HitErrorInformation } from "@rian8337/osu-droid-replay-analyzer";

/**
 * Represents data of a calculated replay.
 */
export interface ReplayAttributes {
    /**
     * The hit error information of the replay.
     */
    readonly hitError?: HitErrorInformation;

    /**
     * Information about slider tick hits.
     */
    readonly sliderTickInformation: SliderTickInformation;

    /**
     * Information about slider end hits.
     */
    readonly sliderEndInformation: SliderTickInformation;
}
