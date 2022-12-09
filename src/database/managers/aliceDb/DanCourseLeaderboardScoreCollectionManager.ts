import { DanCourseLeaderboardScore } from "@alice-database/utils/aliceDb/DanCourseLeaderboardScore";
import { DatabaseDanCourseLeaderboardScore } from "@alice-structures/database/aliceDb/DatabaseDanCourseLeaderboardScore";
import { DatabaseDanCourseScore } from "@alice-structures/database/aliceDb/DatabaseDanCourseScore";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `dancourseleaderboard` collection.
 *
 * This collection is responsible for storing all highest scores of players that aren't flagged by 3f detection.
 */
export class DanCourseLeaderboardScoreCollectionManager extends DatabaseCollectionManager<
    DatabaseDanCourseLeaderboardScore,
    DanCourseLeaderboardScore
> {
    protected override utilityInstance: new (
        data: DatabaseDanCourseScore
    ) => DanCourseLeaderboardScore = DanCourseLeaderboardScore;

    override get defaultDocument(): DatabaseDanCourseScore {
        return {
            bad: 0,
            date: Date.now(),
            geki: 0,
            good: 0,
            hash: "",
            isSliderLock: false,
            katu: 0,
            maxCombo: 0,
            miss: 0,
            modstring: "",
            perfect: 0,
            rank: "",
            score: 0,
            skippedTime: 0,
            uid: 0,
            unstableRate: 0,
            username: "",
            useSliderAccuracy: false,
            replayFileName: "",
            grade: 0,
        };
    }

    /**
     * Gets a score from a player.
     *
     * @param uid The uid of the player.
     * @param hash The hash of the player.
     * @returns The score of the player, `null` if not found.
     */
    getScore(
        uid: number,
        hash: string
    ): Promise<DanCourseLeaderboardScore | null> {
        return this.getOne({ uid: uid, hash: hash });
    }
}
