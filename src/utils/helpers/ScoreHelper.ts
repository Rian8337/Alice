import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OfficialDatabaseScore } from "@alice-database/official/schema/OfficialDatabaseScore";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import {
    DroidAPIRequestBuilder,
    Mod,
    ModDoubleTime,
    ModHardRock,
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
        page: number = 1,
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
        accuracyPortion: number = 1 - scorePortion,
    ): number {
        return (
            this.calculateScorePortionScoreV2(
                score,
                misses,
                maxScore,
                mods,
                scorePortion,
            ) +
            this.calculateAccuracyPortionScoreV2(
                accuracy,
                misses,
                mods,
                accuracyPortion,
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
        scorePortion: number,
    ): number {
        const tempScoreV2: number =
            Math.sqrt(
                (this.removeScoreMultiplier(score, mods) *
                    (mods.some((m) => m instanceof ModNoFail) ? 2 : 1)) /
                    maxScore,
            ) *
            1e6 *
            scorePortion;

        return Math.max(
            0,
            this.applyScoreMultiplier(
                tempScoreV2 - this.getScoreV2MissPenalty(tempScoreV2, misses),
                mods,
            ),
        );
    }

    /**
     * Calculates the accuracy portion of ScoreV2.
     *
     * @param accuracy The accuracy achieved, from 0 to 1.
     * @param misses The amount of misses achieved.
     * @param mods The mods that were used.
     * @param accuracyPortion The portion of which accuracy will contribute to ScoreV2.
     * @returns The accuracy portion of ScoreV2.
     */
    static calculateAccuracyPortionScoreV2(
        accuracy: number,
        misses: number,
        mods: Mod[],
        accuracyPortion: number,
    ): number {
        const tempScoreV2: number =
            Math.pow(accuracy, 2) * 1e6 * accuracyPortion;

        return Math.max(
            0,
            this.applyScoreMultiplier(
                tempScoreV2 - this.getScoreV2MissPenalty(tempScoreV2, misses),
                mods,
            ),
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
                    : 23875169174 + 15000000000 * (level - 100),
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
        misses: number,
    ): number {
        return misses * 5e-3 * tempScoreV2;
    }

    /**
     * Applies score multiplier to a score value.
     *
     * @param score The score value.
     * @param mods The mods to apply.
     */
    static applyScoreMultiplier(score: number, mods: Mod[]): number {
        for (const mod of mods) {
            if (mod instanceof ModHardRock) {
                score *= 1.1;
                continue;
            }

            if (mod.isApplicableToDroid()) {
                score *= mod.droidScoreMultiplier;
            }
        }

        if (
            mods.filter(
                (m) => m instanceof ModHidden || m instanceof ModDoubleTime,
            ).length === 2
        ) {
            score /= new ModHidden().droidScoreMultiplier;
        }

        return Math.round(score);
    }

    /**
     * Removes score multiplier from a score value.
     *
     * @param score The score value.
     * @param mods The mods to remove.
     */
    static removeScoreMultiplier(score: number, mods: Mod[]): number {
        for (const mod of mods) {
            if (mod.isApplicableToDroid() && mod.droidScoreMultiplier > 0) {
                score /= mod.droidScoreMultiplier;
            }
        }

        return Math.round(score);
    }

    /**
     * Gets the recent scores of a player, combined with scores from the recent
     * plays database when necessary.
     *
     * A play submitted to the server will be of instance `Score` or `OfficialDatabaseScore`, while
     * a play submitted to the recent plays database will be of instance `RecentPlay`.
     *
     * @param uid The uid of the player.
     * @param existingScores Existing scores, usually obtained from an API response, if any.
     * @param checkOfficialDatabase Whether to check the official database for scores.
     * @returns The recent scores of the player, sorted by submission date descendingly.
     */
    static async getRecentScores<K extends keyof OfficialDatabaseScore>(
        uid: number,
        existingScores: (
            | Pick<OfficialDatabaseScore, K>
            | Score
            | RecentPlay
        )[] = [],
    ): Promise<(Pick<OfficialDatabaseScore, K> | Score | RecentPlay)[]> {
        const recentPlays =
            await DatabaseManager.aliceDb.collections.recentPlays.getFromUid(
                uid,
            );

        for (const play of recentPlays) {
            const idx = existingScores.findIndex(
                (v) => v instanceof Score && v.scoreID === play.scoreId,
            );

            if (idx !== -1) {
                // Remove in favor of `RecentPlay`.
                existingScores.splice(idx, 1);
            }
        }

        return (<(Score | RecentPlay)[]>existingScores)
            .concat(recentPlays)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
}
