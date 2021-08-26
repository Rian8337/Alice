import { OsuBind } from "@alice-database/utils/aliceDb/OsuBind";
import { DatabaseOsuBind } from "@alice-interfaces/database/aliceDb/DatabaseOsuBind";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `osubind` collection.
 */
export class OsuBindCollectionManager extends DatabaseCollectionManager<DatabaseOsuBind, OsuBind> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseOsuBind, OsuBind>;

    get defaultDocument(): DatabaseOsuBind {
        return {
            discordid: "",
            username: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseOsuBind>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseOsuBind, OsuBind>> new OsuBind(client, this.defaultDocument).constructor 
    }
}