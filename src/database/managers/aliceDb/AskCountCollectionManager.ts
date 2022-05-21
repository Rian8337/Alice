import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { AskCount } from "@alice-database/utils/aliceDb/AskCount";
import { DatabaseAskCount } from "@alice-interfaces/database/aliceDb/DatabaseAskCount";
import { Snowflake } from "discord.js";

/**
 * A manager for the `askcount` collection.
 */
export class AskCountCollectionManager extends DatabaseCollectionManager<
    DatabaseAskCount,
    AskCount
> {
    protected override readonly utilityInstance: new (
        data: DatabaseAskCount
    ) => AskCount = AskCount;

    override get defaultDocument(): DatabaseAskCount {
        return {
            discordid: "",
            count: 0,
        };
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
