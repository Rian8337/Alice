import {
    DroidAPIRequestBuilder,
    Mod,
    ModDoubleTime,
    ModHidden,
    ModNoFail,
    RequestResponse,
} from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";

/**
 * A helper for global score-related things.
 */
export abstract class ScoreHelper {
    /**
     * Retrieves the leaderboard of a beatmap.
     *
     * @param hash The MD5 hash of the beatmap.
     * @param page The page to retrieve. Defaults to 1.
     */
    static async fetchDroidLeaderboard(
        hash: string,
        page: number = 1
    ): Promise<Score[]> {
        const apiRequestBuilder: DroidAPIRequestBuilder =
            new DroidAPIRequestBuilder()
                .setEndpoint("scoresearchv2.php")
                .addParameter("hash", hash)
                .addParameter("page", Math.max(0, page - 1))
                .addParameter("order", "score");

        const result: RequestResponse = await apiRequestBuilder.sendRequest();

        if (result.statusCode !== 200) {
            throw new Error("Droid API request failed");
        }

        const data: string[] = result.data.toString("utf-8").split("<br>");

        data.shift();

        return data.map((v) => new Score().fillInformation(v));
    }

    /**
     * Calculates an osu!droid ScoreV2 value.
     *
     * @param score The ScoreV1 achieved.
     * @param accuracy The accuracy achieved, from 0 to 1.
     * @param misses The amount of misses achieved.
     * @param maxScore The maximum score of the beatmap to calculate.
     * @param mods The mods that were used.
     * @param scorePortion The portion of which the maximum score will contribute to ScoreV2.
     * @param accuracyPortion The portion of which accuracy will contribute to ScoreV2. Defaults to `1 - scorePortion`.
     * @returns The ScoreV2 value.
     */
    static calculateScoreV2(
        score: number,
        accuracy: number,
        misses: number,
        maxScore: number,
        mods: Mod[],
        scorePortion: number,
        accuracyPortion: number = 1 - scorePortion
    ): number {
        return (
            this.calculateScorePortionScoreV2(
                score,
                misses,
                maxScore,
                mods,
                scorePortion
            ) +
            this.calculateAccuracyPortionScoreV2(
                accuracy,
                misses,
                accuracyPortion
            )
        );
    }

    /**
     * Calculates the score portion of ScoreV2.
     *
     * @param score The score achieved.
     * @param misses The amount of misses achieved.
     * @param maxScore The maximum score of the beatmap to calculate.
     * @param mods The mods that were used.
     * @param scorePortion The portion of which the maximum score will contribute to ScoreV2.
     * @returns The score portion of ScoreV2.
     */
    static calculateScorePortionScoreV2(
        score: number,
        misses: number,
        maxScore: number,
        mods: Mod[],
        scorePortion: number
    ): number {
        const applyHiddenPenalty: boolean =
            mods.filter(
                (m) => m instanceof ModHidden || m instanceof ModDoubleTime
            ).length === 2;

        const tempScoreV2: number =
            Math.sqrt(
                (score * (mods.some((m) => m instanceof ModNoFail) ? 2 : 1)) /
                    (maxScore *
                        (applyHiddenPenalty
                            ? new ModHidden().scoreMultiplier
                            : 1))
            ) *
            1e6 *
            scorePortion;

        return Math.max(
            0,
            Math.round(
                tempScoreV2 - this.getScoreV2MissPenalty(tempScoreV2, misses)
            )
        );
    }

    /**
     * Calculates the accuracy portion of ScoreV2.
     *
     * @param accuracy The accuracy achieved, from 0 to 1.
     * @param misses The amount of misses achieved.
     * @param accuracyPortion The portion of which accuracy will contribute to ScoreV2.
     * @returns The accuracy portion of ScoreV2.
     */
    static calculateAccuracyPortionScoreV2(
        accuracy: number,
        misses: number,
        accuracyPortion: number
    ): number {
        const tempScoreV2: number =
            Math.pow(accuracy, 2) * 1e6 * accuracyPortion;

        return Math.max(
            0,
            Math.round(
                tempScoreV2 - this.getScoreV2MissPenalty(tempScoreV2, misses)
            )
        );
    }

    /**
     * Calculates the profile level from a score value.
     *
     * @param score The score value.
     * @returns The profile level of the score value.
     */
    static calculateProfileLevel(score: number): number {
        const calculateScoreRequirement = (level: number): number => {
            return Math.round(
                level <= 100
                    ? ((5000 / 3) *
                          (4 * Math.pow(level, 3) -
                              3 * Math.pow(level, 2) -
                              level) +
                          1.25 * Math.pow(1.8, level - 60)) /
                          1.128
                    : 23875169174 + 15000000000 * (level - 100)
            );
        };

        let level: number = 1;

        while (calculateScoreRequirement(level + 1) <= score) {
            ++level;
        }

        const nextLevelReq: number =
            calculateScoreRequirement(level + 1) -
            calculateScoreRequirement(level);
        const curLevelReq: number = score - calculateScoreRequirement(level);
        level += curLevelReq / nextLevelReq;

        return level;
    }

    /**
     * Gets the ScoreV2 penalty for misses.
     *
     * @param tempScoreV2 The temporary ScoreV2 to calculate for.
     * @param misses The amount of misses achieved.
     */
    private static getScoreV2MissPenalty(
        tempScoreV2: number,
        misses: number
    ): number {
        return misses * 5e-3 * tempScoreV2;
    }
}
