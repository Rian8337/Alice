import { MapBlacklist } from "@alice-database/utils/elainaDb/MapBlacklist";
import { DatabaseMapBlacklist } from "@alice-interfaces/database/elainaDb/DatabaseMapBlacklist";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `mapblacklist` collection.
 */
export class MapBlacklistCollectionManager extends DatabaseCollectionManager<DatabaseMapBlacklist, MapBlacklist> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseMapBlacklist, MapBlacklist>;

    get defaultDocument(): DatabaseMapBlacklist {
        return {
            beatmapID: 0,
            reason: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseMapBlacklist>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseMapBlacklist, MapBlacklist>> new MapBlacklist(client, this.defaultDocument).constructor
    }
}