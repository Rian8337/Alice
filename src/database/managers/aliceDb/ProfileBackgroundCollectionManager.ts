import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";
import { DatabaseProfileBackground } from "structures/database/aliceDb/DatabaseProfileBackground";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `profilebackgrounds` collection.
 */
export class ProfileBackgroundCollectionManager extends DatabaseCollectionManager<
    DatabaseProfileBackground,
    ProfileBackground
> {
    protected override readonly utilityInstance: new (
        data: DatabaseProfileBackground
    ) => ProfileBackground = ProfileBackground;

    override get defaultDocument(): DatabaseProfileBackground {
        return {
            id: "bg",
            name: "Default",
        };
    }
}
