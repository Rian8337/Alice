import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { DatabaseRankedScore } from "@alice-interfaces/database/aliceDb/DatabaseRankedScore";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as DiscordCollection } from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { FindOptions } from "mongodb";

/**
 * A manager for the `playerscore` collection.
 */
export class RankedScoreCollectionManager extends DatabaseCollectionManager<
    DatabaseRankedScore,
    RankedScore
> {
    protected override readonly utilityInstance: new (
        data: DatabaseRankedScore
    ) => RankedScore = RankedScore;

    override get defaultDocument(): DatabaseRankedScore {
        return {
            level: 0,
            playc: 0,
            score: 0,
            scorelist: [],
            uid: 0,
            username: "",
        };
    }

    /**
     * Gets the ranked score leaderboard.
     */
    async getLeaderboard(): Promise<DiscordCollection<number, RankedScore>> {
        const rankedScore: DatabaseRankedScore[] = await this.collection
            .find(
                {},
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                        score: 1,
                        playc: 1,
                        username: 1,
                        level: 1,
                    },
                }
            )
            .sort({ score: -1 })
            .toArray();

        return ArrayHelper.arrayToCollection(
            rankedScore.map((v) => new RankedScore(v)),
            "uid"
        );
    }

    /**
     * Gets the ranked score information of an osu!droid account.
     *
     * @param uid The uid of the osu!droid account.
     */
    getFromUid(
        uid: number,
        options?: {
            /**
             * Whether to include all plays in the ranked score information. Defaults to `false`.
             */
            retrieveAllPlays: boolean;
        }
    ): Promise<RankedScore | null> {
        const dbOptions: FindOptions<DatabaseRankedScore> = {};

        if (!options?.retrieveAllPlays) {
            dbOptions.projection ??= {};
            dbOptions.projection.scorelist = 0;
        }

        return this.getOne({ uid: uid }, dbOptions);
    }
}
