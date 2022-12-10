import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseDanCourseScore } from "@alice-structures/database/aliceDb/DatabaseDanCourseScore";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "mongodb";

/**
 * Represents a dan course score.
 */
export class DanCourseScore extends Manager implements DatabaseDanCourseScore {
    grade: number;
    readonly replayFileName: string;
    uid: number;
    username: string;
    hash: string;
    modstring: string;
    score: number;
    maxCombo: number;
    rank: string;
    geki: number;
    perfect: number;
    katu: number;
    good: number;
    bad: number;
    miss: number;
    date: number;
    unstableRate: number;
    isSliderLock: boolean;
    useSliderAccuracy: boolean;
    skippedTime: number;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseDanCourseScore = DatabaseManager.aliceDb?.collections
            .danCourseScores.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.grade = data.grade;
        this.replayFileName = data.replayFileName;
        this.uid = data.uid;
        this.username = data.username;
        this.hash = data.hash;
        this.modstring = data.modstring;
        this.score = data.score;
        this.maxCombo = data.maxCombo;
        this.rank = data.rank;
        this.geki = data.geki;
        this.perfect = data.perfect;
        this.katu = data.katu;
        this.good = data.good;
        this.bad = data.bad;
        this.miss = data.miss;
        this.date = data.date;
        this.unstableRate = data.unstableRate;
        this.isSliderLock = data.isSliderLock;
        this.useSliderAccuracy = data.useSliderAccuracy;
        this.skippedTime = data.skippedTime;
    }
}
