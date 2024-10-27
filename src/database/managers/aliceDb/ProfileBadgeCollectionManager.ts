import { ProfileBadge } from "@database/utils/aliceDb/ProfileBadge";
import { DatabaseProfileBadge } from "structures/database/aliceDb/DatabaseProfileBadge";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as DiscordCollection } from "discord.js";
import { ArrayHelper } from "@utils/helpers/ArrayHelper";

/**
 * A manager for the `profilebadges` collection.
 */
export class ProfileBadgeCollectionManager extends DatabaseCollectionManager<
    DatabaseProfileBadge,
    ProfileBadge
> {
    protected override readonly utilityInstance: new (
        data: DatabaseProfileBadge,
    ) => ProfileBadge = ProfileBadge;

    override get defaultDocument(): DatabaseProfileBadge {
        return {
            description: "",
            id: "",
            name: "",
            requirement: 0,
            type: "unclaimable",
        };
    }

    /**
     * Gets all badges sorted by type and name.
     */
    async getAllBadgesSorted(): Promise<
        DiscordCollection<string, ProfileBadge>
    > {
        const badges: DatabaseProfileBadge[] = await this.collection
            .find(
                {},
                { projection: { _id: 0, id: 1, name: 1, description: 1 } },
            )
            .sort({ type: 1, name: 1 })
            .toArray();

        return ArrayHelper.arrayToCollection(
            badges.map((v) => new ProfileBadge(v)),
            "id",
        );
    }
}
