import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a mappool for tournament.
 */
export class TournamentMappool
    extends Manager
    implements DatabaseTournamentMappool
{
    forcePR: boolean;
    poolid: string;
    map: TournamentBeatmap[];
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseTournamentMappool = DatabaseManager.elainaDb?.collections
            .tournamentMappool.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.forcePR = data.forcePR;
        this.poolid = data.poolid;
        this.map = data.map ?? [];
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
        const pickData: TournamentBeatmap | undefined = this.map.find(
            (v) => v.pick === pick
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
}
