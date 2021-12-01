import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseRankedScore } from "@alice-interfaces/database/aliceDb/DatabaseRankedScore";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { RankedScoreHelper } from "@alice-utils/helpers/RankedScoreHelper";
import { ObjectId } from "bson";
import { Collection } from "discord.js";

/**
 * Represents an osu!droid account's ranked score.
 */
export class RankedScore extends Manager {
    /**
     * The UID of the account.
     */
    uid: number;

    /**
     * The username of the account.
     */
    username: string;

    /**
     * The total ranked score of the account.
     */
    score: number;

    /**
     * The play count of the user (how many scores the user have submitted into the ranked score system).
     */
    playc: number;

    /**
     * The current level of the player.
     */
    level: number;

    /**
     * The list of scores that have been submitted, mapped by their hash.
     */
    scorelist: Collection<string, number>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseRankedScore = DatabaseManager.aliceDb?.collections
            .rankedScore.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.uid = data.uid;
        this.username = data.username;
        this.score = data.score;
        this.playc = data.playc;
        this.level = data.level;
        // Could call <Array>.reverse() but TypeScript complains
        this.scorelist = new Collection(
            data.scorelist?.map((v) => [v[1], v[0]]) ?? []
        );
    }

    /**
     * Sets a new ranked score based on the given list.
     *
     * @param list The list of scores.
     * @param playCountIncrement The amount to increment towards play count.
     * @returns An object containing information about the operation.
     */
    async setNewRankedScoreValue(
        list: Collection<string, number>,
        playCountIncrement: number
    ): Promise<OperationResult> {
        this.scorelist = list.clone();

        this.score = list.reduce((a, v) => a + v, 0);

        this.level = RankedScoreHelper.calculateLevel(this.score);

        this.playc += playCountIncrement;

        return DatabaseManager.aliceDb.collections.rankedScore.update(
            { uid: this.uid },
            {
                $set: {
                    level: this.level,
                    score: this.score,
                    scorelist: RankedScoreHelper.toArray(this.scorelist),
                    username: this.username,
                },
                $inc: {
                    playc: playCountIncrement,
                },
            },
            { upsert: true }
        );
    }
}
