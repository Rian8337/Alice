import { Bot } from "@alice-core/Bot";
import { DatabaseDPPBan } from "@alice-interfaces/database/elainaDb/DatabaseDPPBan";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a droid performance point (dpp) ban information of a user.
 */
export class DPPBan extends Manager implements DatabaseDPPBan {
    uid: number;
    reason: string;
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseDPPBan) {
        super(client);

        this._id = data._id;
        this.uid = data.uid;
        this.reason = data.reason;
    }
}