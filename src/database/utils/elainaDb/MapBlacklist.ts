import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseMapBlacklist } from "structures/database/elainaDb/DatabaseMapBlacklist";
import { Manager } from "@utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a blacklisted beatmap.
 */
export class MapBlacklist extends Manager implements DatabaseMapBlacklist {
    beatmapID: number;
    reason: string;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseMapBlacklist = DatabaseManager.elainaDb?.collections
            .mapBlacklist.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.beatmapID = data.beatmapID;
        this.reason = data.reason;
    }
}
