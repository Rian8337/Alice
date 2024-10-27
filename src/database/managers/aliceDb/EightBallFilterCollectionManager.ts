import { DatabaseCollectionManager } from "@database/managers/DatabaseCollectionManager";
import { EightBallFilter } from "@database/utils/aliceDb/EightBallFilter";
import { DatabaseEightBallFilter } from "structures/database/aliceDb/DatabaseEightBallFilter";

/**
 * A manager for the `responsefilter` collection.
 */
export class EightBallFilterCollectionManager extends DatabaseCollectionManager<
    DatabaseEightBallFilter,
    EightBallFilter
> {
    protected override readonly utilityInstance: new (
        data: DatabaseEightBallFilter,
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
