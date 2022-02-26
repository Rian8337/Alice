import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
import { TournamentScore } from "@alice-interfaces/tournament/TournamentScore";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { ModHidden, ModDoubleTime, ModNoFail } from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { ObjectId } from "bson";
import { Collection } from "discord.js";

/**
 * Represents a mappool for tournament.
 */
export class TournamentMappool extends Manager {
    /**
     * The ID of the mappool.
     */
    poolid: string;

    /**
     * Whether this mappool enforces the PR mod.
     */
    forcePR: boolean;

    /**
     * The beatmaps in this tournament, mapped by pick ID.
     */
    map: Collection<string, TournamentBeatmap>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseTournamentMappool = DatabaseManager.elainaDb?.collections
            .tournamentMappool.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.forcePR = data.forcePR;
        this.poolid = data.poolid;
        this.map = ArrayHelper.arrayToCollection(data.map ?? [], "pick");
    }

    /**
     * Calculates the ScoreV2 for a pick with respect to a score.
     *
     * @param pick The pick to calculate for.
     * @param score The score achieved.
     * @param accuracy The accuracy achieved, from 0 to 1.
     * @param misses The amount of misses achieved.
     * @param applyHiddenPenalty Whether to calculate for HD penalty in DT in mind.
     * @returns The final ScoreV2.
     */
    calculateScoreV2(
        pick: string,
        score: number,
        accuracy: number,
        misses: number,
        options?: Partial<{
            applyHiddenPenalty: boolean;
            isNoFail: boolean;
        }>
    ): number {
        return (
            this.calculateScorePortionScoreV2(
                pick,
                score,
                misses,
                options?.applyHiddenPenalty ?? false,
                options?.isNoFail ?? false
            ) + this.calculateAccuracyPortionScoreV2(pick, accuracy, misses)
        );
    }

    /**
     * Calculates the score portion of ScoreV2.
     *
     * @param pick The pick to calculate for.
     * @param score The score achieved.
     * @param misses The amount of misses achieved.
     * @param applyHiddenPenalty Whether to calculate for HD penalty with DT in mind.
     * @param isNoFail Whether the NF mod was used.
     * @returns The score portion of ScoreV2 for the pick, 0 if the pick is not found.
     */
    calculateScorePortionScoreV2(
        pick: string,
        score: number,
        misses: number,
        applyHiddenPenalty: boolean,
        isNoFail: boolean
    ): number {
        const pickData: TournamentBeatmap | undefined = this.map.get(
            pick.toUpperCase()
        );

        if (!pickData) {
            return 0;
        }

        const tempScoreV2: number =
            Math.sqrt((score * (isNoFail ? 2 : 1)) / pickData.maxScore) *
            1e6 *
            pickData.scorePortion;

        let scoreV2: number = Math.max(
            0,
            tempScoreV2 - this.getMissPenalty(tempScoreV2, misses)
        );

        if (applyHiddenPenalty) {
            scoreV2 /= 0.59 / 0.56;
        }

        return Math.round(scoreV2);
    }

    /**
     * Calculates the accuracy portion of ScoreV2.
     *
     * @param pick The pick to calculate for.
     * @param accuracy The accuracy achieved, from 0 to 1.
     * @param misses The amount of misses achieved.
     * @returns The accuracy portion of ScoreV2 for the pick, 0 if the pick is not found.
     */
    calculateAccuracyPortionScoreV2(
        pick: string,
        accuracy: number,
        misses: number
    ): number {
        const pickData: TournamentBeatmap | undefined = this.map.get(
            pick.toUpperCase()
        );

        if (!pickData) {
            return 0;
        }

        const tempScoreV2: number =
            Math.pow(accuracy, 2) * 1e6 * (1 - pickData.scorePortion);

        return Math.max(
            0,
            Math.round(tempScoreV2 - this.getMissPenalty(tempScoreV2, misses))
        );
    }

    /**
     * Gets a beatmap from this tournament mappool by pick ID.
     *
     * @param pick The pick ID of the beatmap.
     * @returns The beatmap, `null` if not found.
     */
    getBeatmapFromPick(pick: string): TournamentBeatmap | null {
        return this.map.get(pick.toUpperCase()) ?? null;
    }

    /**
     * Gets a beatmap from this tournament mappool by MD5 hash.
     *
     * @param hash The MD5 hash of the beatmap.
     * @returns The beatmap, `null` if not found.
     */
    getBeatmapFromHash(hash: string): TournamentBeatmap | null {
        return this.map.find((v) => v.hash === hash) ?? null;
    }

    /**
     * Retrieves the leaderboard of a beatmap from this tournament pool.
     *
     * @param pick The pick ID of the beatmap.
     * @returns The leaderboard of the beatmap.
     */
    async getBeatmapLeaderboard(pick: string): Promise<TournamentScore[]> {
        const pickData: TournamentBeatmap | undefined = this.map.get(
            pick.toUpperCase()
        );

        if (!pickData) {
            return [];
        }

        const scores: TournamentScore[] = [];
        let page: number = 1;
        let retrievedScores: Score[];

        while (
            (retrievedScores = await ScoreHelper.fetchDroidLeaderboard(
                pickData.hash,
                page++
            )).length > 0
        ) {
            scores.push(
                ...retrievedScores.map<TournamentScore>((v) => {
                    return {
                        scoreV2: this.calculateScoreV2(
                            pick,
                            v.score,
                            v.accuracy.value(),
                            v.accuracy.nmiss,
                            {
                                applyHiddenPenalty:
                                    v.mods.filter(
                                        (m) =>
                                            m instanceof ModHidden ||
                                            m instanceof ModDoubleTime
                                    ).length >= 2,
                                isNoFail: v.mods.some(
                                    (m) => m instanceof ModNoFail
                                ),
                            }
                        ),
                        score: v,
                    };
                })
            );
        }

        scores.sort((a, b) => {
            return b.scoreV2 - a.scoreV2;
        });

        return scores;
    }

    /**
     * Gets the penalty for misses.
     *
     * @param tempScoreV2 The temporary score V2 to calculate for.
     * @param misses The amount of misses achieved.
     */
    private getMissPenalty(tempScoreV2: number, misses: number): number {
        return misses * 5e-3 * tempScoreV2;
    }
}
