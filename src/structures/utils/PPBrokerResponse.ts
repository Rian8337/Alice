import { SerializedMod } from "@rian8337/osu-base";
import { CacheableDifficultyAttributes } from "@rian8337/osu-difficulty-calculator";
import { HitErrorInformation } from "@rian8337/osu-droid-replay-analyzer";
import { PerformanceAttributes } from "@structures/difficultyattributes/PerformanceAttributes";
import { RawDifficultyAttributes } from "@structures/difficultyattributes/RawDifficultyAttributes";
import { SliderTickInformation } from "@structures/pp/SliderTickInformation";

/**
 * The response of the broker's difficulty route.
 */
export interface PPBrokerDifficultyResponse {
    /**
     * The difficulty attributes.
     */
    readonly difficulty: CacheableDifficultyAttributes<RawDifficultyAttributes>;

    /**
     * The strain chart as a base64-encoded PNG, if requested.
     */
    readonly strainChart?: string;
}

/**
 * The score values a performance calculation used.
 */
export interface PPBrokerResolvedScore {
    readonly n300: number;
    readonly n100: number;
    readonly n50: number;
    readonly nmiss: number;
    readonly combo: number;
    readonly sliderTicksMissed?: number;
    readonly sliderEndsDropped?: number;
    readonly totalScore?: number;
    readonly tapPenalty: number;
    readonly sliderCheesePenalty: number;
}

/**
 * Information derived from a replay.
 */
export interface PPBrokerReplayAttributes {
    readonly hitError: HitErrorInformation | null;
    readonly sliderTickInformation: SliderTickInformation | null;
    readonly sliderEndInformation: SliderTickInformation | null;
}

/**
 * The response of the broker's performance route, and the `calculation` of the score service's
 * online score response.
 */
export interface PPBrokerPerformanceResponse extends PPBrokerDifficultyResponse {
    /**
     * The performance attributes.
     */
    readonly performance: PerformanceAttributes;

    /**
     * The score values the calculation used.
     */
    readonly score: PPBrokerResolvedScore;

    /**
     * The replay attributes, if the score was calculated from a replay.
     */
    readonly replay?: PPBrokerReplayAttributes;
}

/**
 * The response of the score service's online score route.
 */
export interface PPOnlineScoreResponse {
    readonly score: {
        /**
         * All of the score's mods.
         */
        readonly mods: SerializedMod[];
    };

    readonly calculation: PPBrokerPerformanceResponse;
}
