import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { MapShare } from "@alice-database/utils/aliceDb/MapShare";
import { DatabaseMapShare } from "@alice-interfaces/database/aliceDb/DatabaseMapShare";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { MapShareSubmissionStatus } from "@alice-types/utils/MapShareSubmissionStatus";
import { Collection as MongoDBCollection } from "mongodb";
import { Collection as DiscordCollection } from "discord.js";

/**
 * A manager for the `mapshare` collection.
 */
export class MapShareCollectionManager extends DatabaseCollectionManager<
    DatabaseMapShare,
    MapShare
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseMapShare,
        MapShare
    >;

    override get defaultDocument(): DatabaseMapShare {
        return {
            beatmap_id: 0,
            date: Math.floor(Date.now() / 1000),
            hash: "",
            id: "",
            status: "pending",
            submitter: "",
            summary: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseMapShare>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseMapShare, MapShare>
        >new MapShare().constructor;
    }

    /**
     * Gets map share submissions that have the specified status.
     *
     * @param status The status.
     * @returns The map share submissions, mapped by beatmap ID.
     */
    getByStatus(
        status: MapShareSubmissionStatus
    ): Promise<DiscordCollection<number, MapShare>> {
        return this.get("beatmap_id", { status: status });
    }

    /**
     * Gets a map share submission from its beatmap ID.
     *
     * @param id The beatmap ID that is used in the submission.
     * @returns The submission, `null` if not found.
     */
    getByBeatmapId(id: number): Promise<MapShare | null> {
        return this.getOne({ beatmap_id: id });
    }
}
