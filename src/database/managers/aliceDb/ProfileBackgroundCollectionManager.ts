import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";
import { DatabaseProfileBackground } from "@alice-interfaces/database/aliceDb/DatabaseProfileBackground";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";

/**
 * A manager for the `profilebackgrounds` collection.
 */
export class ProfileBackgroundCollectionManager extends DatabaseCollectionManager<
    DatabaseProfileBackground,
    ProfileBackground
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseProfileBackground,
        ProfileBackground
    >;

    override get defaultDocument(): DatabaseProfileBackground {
        return {
            id: "bg",
            name: "Default",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseProfileBackground>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<
                DatabaseProfileBackground,
                ProfileBackground
            >
        >new ProfileBackground().constructor;
    }
}
