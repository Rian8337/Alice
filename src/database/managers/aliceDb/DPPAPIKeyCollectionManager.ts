import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { DPPAPIKey } from "@alice-database/utils/aliceDb/DPPAPIKey";
import { DatabaseDPPAPIKey } from "@alice-interfaces/database/aliceDb/DatabaseDPPAPIKey";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `dppapikey` collection.
 */
export class DPPAPIKeyCollectionManager extends DatabaseCollectionManager<DatabaseDPPAPIKey, DPPAPIKey> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseDPPAPIKey, DPPAPIKey>;

    get defaultDocument(): DatabaseDPPAPIKey {
        return {
            key: "",
            owner: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseDPPAPIKey>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseDPPAPIKey, DPPAPIKey>> new DPPAPIKey(client, this.defaultDocument).constructor
    }
}