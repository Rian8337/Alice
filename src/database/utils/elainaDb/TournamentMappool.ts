import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
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
     * Calculates ScoreV2 of a score.
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
        applyHiddenPenalty: boolean
    ): number {
        const pickData: TournamentBeatmap | undefined = this.map.get(
            pick.toUpperCase()
        );

        if (!pickData) {
            return 0;
        }

        const tempScoreV2: number =
            Math.sqrt(score / pickData.maxScore) * 1e6 * pickData.scorePortion +
            Math.pow(accuracy, 2) * 1e6 * (1 - pickData.scorePortion);

        let scoreV2: number = Math.max(
            0,
            tempScoreV2 - misses * 5e-3 * tempScoreV2
        );

        if (applyHiddenPenalty) {
            scoreV2 /= 0.59 / 0.56;
        }

        return Math.round(scoreV2);
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
}
