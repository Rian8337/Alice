import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { EightBallFilter } from "@alice-database/utils/aliceDb/EightBallFilter";
import { DatabaseEightBallFilter } from "@alice-interfaces/database/aliceDb/DatabaseEightBallFilter";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `responsefilter` collection.
 */
export class EightBallFilterCollectionManager extends DatabaseCollectionManager<
    DatabaseEightBallFilter,
    EightBallFilter
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseEightBallFilter,
        EightBallFilter
    >;

    override get defaultDocument(): DatabaseEightBallFilter {
        return {
            badwords: [],
            hate: [],
            like: [],
            name: "",
            response: [],
        };
    }

    constructor(collection: MongoDBCollection<DatabaseEightBallFilter>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseEightBallFilter, EightBallFilter>
        >new EightBallFilter().constructor;
    }
}
