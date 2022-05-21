import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { DatabaseMapWhitelist } from "@alice-interfaces/database/elainaDb/DatabaseMapWhitelist";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Filter, Sort } from "mongodb";
import { Collection as DiscordCollection } from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `mapwhitelist` command.
 */
export class MapWhitelistCollectionManager extends DatabaseCollectionManager<
    DatabaseMapWhitelist,
    MapWhitelist
> {
    protected override readonly utilityInstance: new (
        data: DatabaseMapWhitelist
    ) => MapWhitelist = MapWhitelist;

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

    /**
     * Gets a list of whitelisted beatmaps.
     *
     * @param page The page to get.
     * @param searchQuery The query to search for.
     * @param sort The sorting option.
     * @param amount The amount of beatmaps to search. Defaults to 10.
     * @returns The whitelisted beatmaps that matches the search query.
     */
    async getWhitelistedBeatmaps(
        page: number,
        searchQuery: Filter<DatabaseMapWhitelist> = {},
        sort: Sort = {},
        amount: number = 10
    ): Promise<MapWhitelist[]> {
        const result: DatabaseMapWhitelist[] = await this.collection
            .find(searchQuery, {
                projection: { _id: 1, mapid: 1, mapname: 1, diffstat: 1 },
            })
            .sort(sort)
            .skip(amount * (page - 1))
            .limit(amount)
            .toArray();

        return result.map((v) => new MapWhitelist(v));
    }

    /**
     * Gets the amount of beatmaps found if performing a search for whitelisted beatmaps
     * using a search query.
     *
     * @param searchQuery The search query.
     * @returns The amount of beatmaps found with the given search query.
     */
    getWhitelistQueryResultCount(
        searchQuery: Filter<DatabaseMapWhitelist>
    ): Promise<number> {
        return this.collection.countDocuments(searchQuery);
    }
}
