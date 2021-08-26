import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { DatabasePrototypePP } from "@alice-interfaces/database/aliceDb/DatabasePrototypePP";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `prototypepp` collection.
 */
export class PrototypePPCollectionManager extends DatabaseCollectionManager<DatabasePrototypePP, PrototypePP> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabasePrototypePP, PrototypePP>;

    get defaultDocument(): DatabasePrototypePP {
        return {
            discordid: "",
            lastUpdate: Date.now(),
            pp: [],
            pptotal: 0,
            uid: 0,
            username: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabasePrototypePP>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabasePrototypePP, PrototypePP>> new PrototypePP(client, this.defaultDocument).constructor
    }
}