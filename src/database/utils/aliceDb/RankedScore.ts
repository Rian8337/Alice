import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseRankedScore } from "@alice-interfaces/database/aliceDb/DatabaseRankedScore";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { RankedScoreHelper } from "@alice-utils/helpers/RankedScoreHelper";
import { ObjectId } from "bson";
import { Collection } from "discord.js";
import { UpdateFilter, UpdateOptions } from "mongodb";
import { Score } from "@rian8337/osu-droid-utilities";

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
     * Adds new ranked scores.
     *
     * @param scores The list of scores.
     * @returns An object containing information about the operation.
     */
    async addScores(scores: Score[]): Promise<OperationResult> {
        const scoresToAdd: [number, string][] = [];

        const query: UpdateFilter<DatabaseRankedScore> = {
            $set: {},
            $push: {
                scorelist: {
                    $each: scoresToAdd,
                },
            },
            $inc: {
                playc: scores.length,
            },
        };

        const options: UpdateOptions = {
            arrayFilters: [],
        };

        let addedScore: number = 0;

        for (const score of scores) {
            const cachedScore: number | undefined = this.scorelist.get(
                score.hash
            );

            if (cachedScore) {
                if (cachedScore >= score.score) {
                    continue;
                }

                addedScore += score.score - cachedScore;

                Object.defineProperty(
                    query.$set,
                    `scorelist.$[filter${score.hash}].1`,
                    {
                        value: score.hash,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    }
                );

                options.arrayFilters!.push(
                    Object.defineProperty({}, `filter${score.hash}.0`, {
                        value: score.hash,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    })
                );
            } else {
                addedScore += score.score;

                scoresToAdd.push([score.score, score.hash]);
            }
        }

        if (addedScore === 0) {
            return this.createOperationResult(true);
        }

        this.score += addedScore;

        this.level = RankedScoreHelper.calculateLevel(this.score);

        Object.defineProperty(query.$set, "level", {
            value: this.level,
            writable: true,
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(query.$inc, "score", {
            value: addedScore,
            writable: true,
            configurable: true,
            enumerable: true,
        });

        return DatabaseManager.aliceDb.collections.rankedScore.updateOne(
            { uid: this.uid },
            query,
            options
        );
    }
}
