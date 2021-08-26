import { ProfileBadge } from "@alice-database/utils/aliceDb/ProfileBadge";
import { DatabaseProfileBadge } from "@alice-interfaces/database/aliceDb/DatabaseProfileBadge";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";
import { Collection as DiscordCollection } from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `profilebadges` collection.
 */
export class ProfileBadgeCollectionManager extends DatabaseCollectionManager<DatabaseProfileBadge, ProfileBadge> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseProfileBadge, ProfileBadge>;

    get defaultDocument(): DatabaseProfileBadge {
        return {
            description: "",
            id: "",
            name: "",
            requirement: 0,
            type: "unclaimable"
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseProfileBadge>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseProfileBadge, ProfileBadge>> new ProfileBadge(client, this.defaultDocument).constructor
    }

    /**
     * Gets all badges sorted by type and name.
     */
    async getAllBadgesSorted(): Promise<DiscordCollection<string, ProfileBadge>> {
        const badges: DatabaseProfileBadge[] = await this.collection.find(
            {}, { projection: { _id: 0, id: 1, name: 1, description: 1 } }
        ).sort({ type: 1, name: 1 }).toArray();

        return ArrayHelper.arrayToCollection(badges.map(v => new ProfileBadge(this.client, v)), "id");
    }
}