import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
import { TournamentScore } from "@alice-interfaces/tournament/TournamentScore";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { ModHidden, ModDoubleTime, ModNoFail, Mod } from "@rian8337/osu-base";
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
     * @param mods The mods that were used.
     * @returns The final ScoreV2.
     */
    calculateScoreV2(
        pick: string,
        score: number,
        accuracy: number,
        misses: number,
        mods: Mod[]
    ): number {
        return (
            this.calculateScorePortionScoreV2(pick, score, misses, mods) +
            this.calculateAccuracyPortionScoreV2(pick, accuracy, misses)
        );
    }

    /**
     * Calculates the score portion of ScoreV2.
     *
     * @param pick The pick to calculate for.
     * @param score The score achieved.
     * @param misses The amount of misses achieved.
     * @param mods The mods that were used.
     * @returns The score portion of ScoreV2 for the pick, 0 if the pick is not found.
     */
    calculateScorePortionScoreV2(
        pick: string,
        score: number,
        misses: number,
        mods: Mod[]
    ): number {
        const pickData: TournamentBeatmap | undefined = this.map.get(
            pick.toUpperCase()
        );

        if (!pickData) {
            return 0;
        }

        const applyHiddenPenalty: boolean =
            mods.filter(
                (m) => m instanceof ModHidden || m instanceof ModDoubleTime
            ).length === 2;

        const tempScoreV2: number =
            Math.sqrt(
                (score * (mods.some((m) => m instanceof ModNoFail) ? 2 : 1)) /
                    (pickData.maxScore *
                        (applyHiddenPenalty
                            ? new ModHidden().scoreMultiplier
                            : 1))
            ) *
            1e6 *
            pickData.scorePortion;

        return Math.max(
            0,
            Math.round(tempScoreV2 - this.getMissPenalty(tempScoreV2, misses))
        );
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
                            v.mods
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
