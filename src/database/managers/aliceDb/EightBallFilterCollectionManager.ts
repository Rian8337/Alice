import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { EightBallFilter } from "@alice-database/utils/aliceDb/EightBallFilter";
import { DatabaseEightBallFilter } from "@alice-interfaces/database/aliceDb/DatabaseEightBallFilter";

/**
 * A manager for the `responsefilter` collection.
 */
export class EightBallFilterCollectionManager extends DatabaseCollectionManager<
    DatabaseEightBallFilter,
    EightBallFilter
> {
    protected override readonly utilityInstance: new (
        data: DatabaseEightBallFilter
    ) => EightBallFilter = EightBallFilter;

    override get defaultDocument(): DatabaseEightBallFilter {
        return {
            badwords: [],
            hate: [],
            like: [],
            name: "",
            response: [],
        };
    }
}
