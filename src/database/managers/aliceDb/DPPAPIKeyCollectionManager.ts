import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { DPPAPIKey } from "@alice-database/utils/aliceDb/DPPAPIKey";
import { DatabaseDPPAPIKey } from "@alice-interfaces/database/aliceDb/DatabaseDPPAPIKey";

/**
 * A manager for the `dppapikey` collection.
 */
export class DPPAPIKeyCollectionManager extends DatabaseCollectionManager<
    DatabaseDPPAPIKey,
    DPPAPIKey
> {
    protected override readonly utilityInstance: new (
        data: DatabaseDPPAPIKey
    ) => DPPAPIKey = DPPAPIKey;

    override get defaultDocument(): DatabaseDPPAPIKey {
        return {
            key: "",
            owner: "",
        };
    }
}
