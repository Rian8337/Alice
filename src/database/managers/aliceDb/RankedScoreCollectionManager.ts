import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { DatabaseRankedScore } from "@alice-interfaces/database/aliceDb/DatabaseRankedScore";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as DiscordCollection } from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `playerscore` collection.
 */
export class RankedScoreCollectionManager extends DatabaseCollectionManager<
    DatabaseRankedScore,
    RankedScore
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseRankedScore,
        RankedScore
    >;

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

    constructor(collection: MongoDBCollection<DatabaseRankedScore>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseRankedScore, RankedScore>
        >new RankedScore().constructor;
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
     * Gets the ranked score information of an osu!droida ccount.
     *
     * @param uid The uid of the osu!droid account.
     */
    getFromUid(uid: number): Promise<RankedScore | null> {
        return this.getOne({ uid: uid });
    }
}
