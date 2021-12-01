import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { AskCount } from "@alice-database/utils/aliceDb/AskCount";
import { DatabaseAskCount } from "@alice-interfaces/database/aliceDb/DatabaseAskCount";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `askcount` collection.
 */
export class AskCountCollectionManager extends DatabaseCollectionManager<
    DatabaseAskCount,
    AskCount
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseAskCount,
        AskCount
    >;

    override get defaultDocument(): DatabaseAskCount {
        return {
            discordid: "",
            count: 0,
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseAskCount>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseAskCount, AskCount>
        >new AskCount(this.defaultDocument).constructor;
    }

    /**
     * Gets the ask count data of a user.
     *
     * @param userId The ID of the user.
     */
    getUserAskCount(userId: Snowflake): Promise<AskCount | null> {
        return this.getOne({ discordid: userId });
    }
}
