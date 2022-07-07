import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseTrackedPlayer } from "@alice-interfaces/database/elainaDb/DatabaseTrackedPlayer";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents an information about a player who's being tracked for recent plays.
 */
export class TrackedPlayer extends Manager implements DatabaseTrackedPlayer {
    uid: number;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseTrackedPlayer = DatabaseManager.elainaDb?.collections
            .playerTracking.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.uid = data.uid;
    }
}
