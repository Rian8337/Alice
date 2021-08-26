import { Bot } from "@alice-core/Bot";
import { DatabaseMapBlacklist } from "@alice-interfaces/database/elainaDb/DatabaseMapBlacklist";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a blacklisted beatmap.
 */
export class MapBlacklist extends Manager implements DatabaseMapBlacklist {
    beatmapID: number;
    reason: string;
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseMapBlacklist) {
        super(client);

        this._id = data._id;
        this.beatmapID = data.beatmapID;
        this.reason = data.reason;
    }
}