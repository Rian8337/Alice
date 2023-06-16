import { DatabaseRecentPlay } from "@alice-structures/database/aliceDb/DatabaseRecentPlay";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import { FindOptions } from "mongodb";

/**
 * A manager for the `recentplays` collection.
 */
export class RecentPlaysCollectionManager extends DatabaseCollectionManager<
    DatabaseRecentPlay,
    RecentPlay
> {
    protected override utilityInstance: new (
        data: DatabaseRecentPlay
    ) => RecentPlay = RecentPlay;

    override get defaultDocument(): DatabaseRecentPlay {
        return {
            accuracy: {
                n300: 0,
                n100: 0,
                n50: 0,
                nmiss: 0,
            },
            title: "",
            combo: 0,
            date: new Date(),
            hash: "",
            mods: "",
            rank: "",
            score: 0,
            uid: 0,
        };
    }

    /**
     * Gets the recent plays of a player from its uid.
     *
     * @param uid The uid of the player.
     * @param options Options for the retrieval.
     * @param limit The limit of recent plays. Defaults to 50.
     * @returns The recent plays of the player.
     */
    async getFromUid(
        uid: number,
        options?: FindOptions<DatabaseRecentPlay>,
        limit: number = 50
    ): Promise<RecentPlay[]> {
        const recentPlays: DatabaseRecentPlay[] = await this.collection
            .find({ uid: uid }, this.processFindOptions(options))
            .sort({ date: -1 })
            .limit(limit)
            .toArray();

        return recentPlays.map((v) => new RecentPlay(v));
    }

    protected override processFindOptions(
        options?: FindOptions<DatabaseRecentPlay> | undefined
    ): FindOptions<DatabaseRecentPlay> | undefined {
        if (options?.projection) {
            options.projection.hash = 1;
        }

        return super.processFindOptions(options);
    }
}
