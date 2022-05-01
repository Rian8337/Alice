import { Collection as MongoDBCollection } from "mongodb";
import { Collection as DiscordCollection } from "discord.js";
import { IllegalMap } from "@alice-database/utils/aliceDb/IllegalMap";
import { DatabaseIllegalMap } from "@alice-interfaces/database/aliceDb/DatabaseIllegalMap";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `illegalmap` collection.
 */
export class IllegalMapCollectionManager extends DatabaseCollectionManager<
    DatabaseIllegalMap,
    IllegalMap
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseIllegalMap,
        IllegalMap
    >;

    override get defaultDocument(): DatabaseIllegalMap {
        return {
            hash: "",
        };
    }

    constructor(collection: MongoDBCollection<DatabaseIllegalMap>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseIllegalMap, IllegalMap>
        >new IllegalMap().constructor;
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
