import { DatabaseCollectionManager } from "@database/managers/DatabaseCollectionManager";
import { DPPAPIKey } from "@database/utils/aliceDb/DPPAPIKey";
import { DatabaseDPPAPIKey } from "structures/database/aliceDb/DatabaseDPPAPIKey";

/**
 * A manager for the `dppapikey` collection.
 */
export class DPPAPIKeyCollectionManager extends DatabaseCollectionManager<
    DatabaseDPPAPIKey,
    DPPAPIKey
> {
    protected override readonly utilityInstance: new (
        data: DatabaseDPPAPIKey,
    ) => DPPAPIKey = DPPAPIKey;

    override get defaultDocument(): DatabaseDPPAPIKey {
        return {
            key: "",
            owner: "",
        };
    }
}
