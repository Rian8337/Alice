import { OsuBind } from "@alice-database/utils/aliceDb/OsuBind";
import { DatabaseOsuBind } from "@alice-interfaces/database/aliceDb/DatabaseOsuBind";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `osubind` collection.
 */
export class OsuBindCollectionManager extends DatabaseCollectionManager<
    DatabaseOsuBind,
    OsuBind
> {
    protected override readonly utilityInstance: new (
        data: DatabaseOsuBind
    ) => OsuBind = OsuBind;

    override get defaultDocument(): DatabaseOsuBind {
        return {
            discordid: "",
            username: "",
        };
    }
}
