import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { MatchChannel } from "@alice-database/utils/aliceDb/MatchChannel";
import { DatabaseMatchChannel } from "@alice-interfaces/database/aliceDb/DatabaseMatchChannel";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `matchchannel` collection.
 */
export class MatchChannelCollectionManager extends DatabaseCollectionManager<DatabaseMatchChannel, MatchChannel> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseMatchChannel, MatchChannel>;

    get defaultDocument(): DatabaseMatchChannel {
        return {
            channelid: "",
            matchid: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseMatchChannel>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseMatchChannel, MatchChannel>> new MatchChannel(client, this.defaultDocument).constructor
    }
}