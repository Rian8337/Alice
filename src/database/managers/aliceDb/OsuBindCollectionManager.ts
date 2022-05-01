import { OsuBind } from "@alice-database/utils/aliceDb/OsuBind";
import { DatabaseOsuBind } from "@alice-interfaces/database/aliceDb/DatabaseOsuBind";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";

/**
 * A manager for the `osubind` collection.
 */
export class OsuBindCollectionManager extends DatabaseCollectionManager<
    DatabaseOsuBind,
    OsuBind
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseOsuBind,
        OsuBind
    >;

    override get defaultDocument(): DatabaseOsuBind {
        return {
            discordid: "",
            username: "",
        };
    }

    constructor(collection: MongoDBCollection<DatabaseOsuBind>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseOsuBind, OsuBind>
        >new OsuBind().constructor;
    }
}
