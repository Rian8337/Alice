import { ScoreRank } from "@structures/utils/ScoreRank";

/**
 * Represents an osu!droid score.
 */
export interface OfficialDatabaseScore {
    readonly id: number;
    readonly uid: number;
    readonly filename: string;
    readonly hash: string;
    mode: string;
    score: number;
    combo: number;
    mark: ScoreRank;
    readonly geki: number;
    perfect: number;
    readonly katu: number;
    good: number;
    bad: number;
    miss: number;
    readonly date: Date;
    accuracy: number;
}
