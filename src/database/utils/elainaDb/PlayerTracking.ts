import { Bot } from "@alice-core/Bot";
import { DatabasePlayerTracking } from "@alice-interfaces/database/elainaDb/DatabasePlayerTracking";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents an information about a player who's being tracked for recent plays.
 */
export class PlayerTracking extends Manager implements DatabasePlayerTracking {
    uid: number;
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabasePlayerTracking) {
        super(client);

        this._id = data._id;
        this.uid = data.uid;
    }
}