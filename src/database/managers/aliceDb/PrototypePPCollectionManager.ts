import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { DatabasePrototypePP } from "@alice-interfaces/database/aliceDb/DatabasePrototypePP";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { Collection as DiscordCollection, Snowflake } from "discord.js";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `prototypepp` collection.
 */
export class PrototypePPCollectionManager extends DatabaseCollectionManager<DatabasePrototypePP, PrototypePP> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabasePrototypePP, PrototypePP>;

    get defaultDocument(): DatabasePrototypePP {
        return {
            discordid: "",
            lastUpdate: Date.now(),
            pp: [],
            pptotal: 0,
            uid: 0,
            username: "",
            previous_bind: []
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabasePrototypePP>) {
        super(collection);

        this.utilityInstance = <DatabaseUtilityConstructor<DatabasePrototypePP, PrototypePP>> new PrototypePP().constructor
    }

    /**
     * Gets the DPP leaderboard.
     * 
     * @returns The leaderboard, mapped by the player's Discord ID.
     */
    async getLeaderboard(): Promise<DiscordCollection<Snowflake, PrototypePP>> {
        const prototypeEntries: DatabasePrototypePP[] = await this.collection.find(
            {},
            { projection: { _id: 0, discordid: 1, uid: 1, pptotal: 1, playc: 1, username: 1 } }
        ).sort({ pptotal: -1 }).toArray();

        return ArrayHelper.arrayToCollection(
            prototypeEntries.map(v => new PrototypePP(v)),
            "discordid"
        );
    }
}