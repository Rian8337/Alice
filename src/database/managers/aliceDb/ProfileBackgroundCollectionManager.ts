import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";
import { DatabaseProfileBackground } from "@alice-interfaces/database/aliceDb/DatabaseProfileBackground";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `profilebackgrounds` collection.
 */
export class ProfileBackgroundCollectionManager extends DatabaseCollectionManager<DatabaseProfileBackground, ProfileBackground> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseProfileBackground, ProfileBackground>;

    get defaultDocument(): DatabaseProfileBackground {
        return {
            id: "bg",
            name: "Default"
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseProfileBackground>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseProfileBackground, ProfileBackground>> new ProfileBackground(client, this.defaultDocument).constructor
    }
}