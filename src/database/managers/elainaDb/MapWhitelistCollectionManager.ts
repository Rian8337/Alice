import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { DatabaseMapWhitelist } from "@alice-interfaces/database/elainaDb/DatabaseMapWhitelist";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { Collection as DiscordCollection } from "discord.js";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `mapwhitelist` command.
 */
export class MapWhitelistCollectionManager extends DatabaseCollectionManager<DatabaseMapWhitelist, MapWhitelist> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseMapWhitelist, MapWhitelist>;

    get defaultDocument(): DatabaseMapWhitelist {
        return {
            diffstat: {
                cs: 0,
                ar: 0,
                od: 0,
                hp: 0,
                sr: 0,
                bpm: 0
            },
            hashid: "",
            mapid: 0,
            mapname: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseMapWhitelist>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseMapWhitelist, MapWhitelist>> new MapWhitelist(client, this.defaultDocument).constructor
    }

    /**
     * Gets beatmaps that are not scanned.
     * 
     * @param amount The amount of beatmaps to get.
     */
    async getUnscannedBeatmaps(amount: number): Promise<DiscordCollection<number, MapWhitelist>> {
        const mapWhitelist: DatabaseMapWhitelist[] = await this.collection.find(
            { whitelistScanDone: { $ne: true } }
        ).limit(amount).toArray();

        return ArrayHelper.arrayToCollection(mapWhitelist.map(v => new MapWhitelist(this.client, v)), "mapid");
    }
}