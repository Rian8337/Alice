import { PickRequirementType } from "@alice-types/tournament/PickRequirementType";

/**
 * Represents a tournament beatmap in a tournament mappool.
 */
export interface TournamentBeatmap {
    /**
     * The pick ID of this tournament beatmap.
     */
    pick: string;

    /**
     * The mode of this tournament beatmap.
     */
    mode: PickRequirementType;

    /**
     * The name (title) of this tournament beatmap.
     */
    name: string;

    /**
     * The MD5 of this tournament beatmap.
     */
    hash: string;

    /**
     * The duration of this tournament beatmap, in seconds.
     */
    duration: number;

    /**
     * The maximum obtainable score from this tournament beatmap with respect to its mode.
     */
    maxScore: number;

    /**
     * The score portion of this tournament beatmap.
     *
     * This denotes the percentage of ScoreV1 that will contribute to the final ScoreV2.
     */
    scorePortion: number;

    /**
     * The accuracy portion of this tournament beatmap.
     *
     * This denotes the percentage of accuracy that will contribute to the final ScoreV2.
     */
    accuracyPortion: number;
}
