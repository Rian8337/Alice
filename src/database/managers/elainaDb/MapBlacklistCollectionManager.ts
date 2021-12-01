import { MapBlacklist } from "@alice-database/utils/elainaDb/MapBlacklist";
import { DatabaseMapBlacklist } from "@alice-interfaces/database/elainaDb/DatabaseMapBlacklist";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";

/**
 * A manager for the `mapblacklist` collection.
 */
export class MapBlacklistCollectionManager extends DatabaseCollectionManager<
    DatabaseMapBlacklist,
    MapBlacklist
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseMapBlacklist,
        MapBlacklist
    >;

    override get defaultDocument(): DatabaseMapBlacklist {
        return {
            beatmapID: 0,
            reason: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseMapBlacklist>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseMapBlacklist, MapBlacklist>
        >new MapBlacklist().constructor;
    }
}
