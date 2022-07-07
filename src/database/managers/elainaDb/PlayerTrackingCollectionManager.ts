import { TrackedPlayer } from "@alice-database/utils/elainaDb/TrackedPlayer";
import { DatabaseTrackedPlayer } from "@alice-interfaces/database/elainaDb/DatabaseTrackedPlayer";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

/**
 * A manager for the `tracking` collection.
 */
export class PlayerTrackingCollectionManager extends DatabaseCollectionManager<
    DatabaseTrackedPlayer,
    TrackedPlayer
> {
    protected override readonly utilityInstance: new (
        data: DatabaseTrackedPlayer
    ) => TrackedPlayer = TrackedPlayer;

    override get defaultDocument(): DatabaseTrackedPlayer {
        return {
            uid: 0,
        };
    }

    /**
     * Adds a player to the tracking list.
     *
     * @param uid The uid of the player.
     * @returns An object containing information about the operation.
     */
    addPlayer(uid: number): Promise<OperationResult> {
        return this.updateOne(
            { uid: uid },
            { $set: { uid: uid } },
            { upsert: true }
        );
    }

    /**
     * Removes a player from the tracking list.
     *
     * @param uid The uid of the player.
     * @returns An object containing information about the operation.
     */
    removePlayer(uid: number): Promise<OperationResult> {
        return this.deleteOne({ uid: uid });
    }
}
