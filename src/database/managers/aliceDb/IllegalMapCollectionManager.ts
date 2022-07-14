import { Collection as DiscordCollection } from "discord.js";
import { IllegalMap } from "@alice-database/utils/aliceDb/IllegalMap";
import { DatabaseIllegalMap } from "structures/database/aliceDb/DatabaseIllegalMap";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `illegalmap` collection.
 */
export class IllegalMapCollectionManager extends DatabaseCollectionManager<
    DatabaseIllegalMap,
    IllegalMap
> {
    protected override readonly utilityInstance: new (
        data: DatabaseIllegalMap
    ) => IllegalMap = IllegalMap;

    override get defaultDocument(): DatabaseIllegalMap {
        return {
            hash: "",
        };
    }

    /**
     * Gets beatmaps that haven't been scanned.
     *
     * @param count The amount of beatmaps to get.
     * @returns The unscanned beatmaps, mapped by MD5 hash.
     */
    async getUnscannedBeatmaps(
        count: number
    ): Promise<DiscordCollection<string, IllegalMap>> {
        const res: DatabaseIllegalMap[] = await this.collection
            .find({ deleteDone: { $ne: true } })
            .limit(count)
            .toArray();

        return ArrayHelper.arrayToCollection(
            res.map((v) => new IllegalMap(v)),
            "hash"
        );
    }
}
