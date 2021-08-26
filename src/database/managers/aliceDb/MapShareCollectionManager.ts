import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { DatabaseMapShare } from "@alice-interfaces/database/aliceDb/DatabaseMapShare";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `mapshare` collection.
 */
export class MapShareCollectionManager extends DatabaseCollectionManager<DatabaseMapShare, MapShare> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseMapShare, MapShare>;

    get defaultDocument(): DatabaseMapShare {
        return {
            beatmap_id: 0,
            date: Math.floor(Date.now() / 1000),
            hash: "",
            id: "",
            status: "pending",
            submitter: "",
            summary: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseMapShare>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseMapShare, MapShare>> new MapShare(client, this.defaultDocument).constructor
    }
}