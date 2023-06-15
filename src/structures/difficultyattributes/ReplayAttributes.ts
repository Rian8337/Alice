import { HitErrorInformation } from "@rian8337/osu-droid-replay-analyzer";

/**
 * Represents data of a calculated replay.
 */
export interface ReplayAttributes {
    /**
     * The hit error information of the replay.
     */
    readonly hitError?: HitErrorInformation;
}
