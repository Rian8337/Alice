import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { DatabaseMapWhitelist } from "@alice-interfaces/database/elainaDb/DatabaseMapWhitelist";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { Collection as DiscordCollection } from "discord.js";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `mapwhitelist` command.
 */
export class MapWhitelistCollectionManager extends DatabaseCollectionManager<
    DatabaseMapWhitelist,
    MapWhitelist
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseMapWhitelist,
        MapWhitelist
    >;

    override get defaultDocument(): DatabaseMapWhitelist {
        return {
            diffstat: {
                cs: 0,
                ar: 0,
                od: 0,
                hp: 0,
                sr: 0,
                bpm: 0,
            },
            hashid: "",
            mapid: 0,
            mapname: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseMapWhitelist>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseMapWhitelist, MapWhitelist>
        >new MapWhitelist().constructor;
    }

    /**
     * Gets beatmaps that are not scanned.
     *
     * @param amount The amount of beatmaps to get.
     */
    async getUnscannedBeatmaps(
        amount: number
    ): Promise<DiscordCollection<number, MapWhitelist>> {
        const mapWhitelist: DatabaseMapWhitelist[] = await this.collection
            .find({ whitelistScanDone: { $ne: true } })
            .limit(amount)
            .toArray();

        return ArrayHelper.arrayToCollection(
            mapWhitelist.map((v) => new MapWhitelist(v)),
            "mapid"
        );
    }
}
