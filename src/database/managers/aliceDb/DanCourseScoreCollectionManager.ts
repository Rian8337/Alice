import { DanCourseScore } from "@alice-database/utils/aliceDb/DanCourseScore";
import { DatabaseDanCourseScore } from "@alice-structures/database/aliceDb/DatabaseDanCourseScore";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `dancoursescore` collection.
 *
 * This collection is responsible for storing all scores that have passed a dan course.
 */
export class DanCourseScoreCollectionManager extends DatabaseCollectionManager<
    DatabaseDanCourseScore,
    DanCourseScore
> {
    protected override utilityInstance: new (
        data: DatabaseDanCourseScore
    ) => DanCourseScore = DanCourseScore;
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
}
