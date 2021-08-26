import { Bot } from "@alice-core/Bot";
import { DatabaseDPPAPIKey } from "@alice-interfaces/database/aliceDb/DatabaseDPPAPIKey";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";

/**
 * Represents a DPP API key.
 */
export class DPPAPIKey extends Manager implements DatabaseDPPAPIKey {
    key: string;
    owner: string;
    readonly _id?: ObjectId;

    constructor(client: Bot, data: DatabaseDPPAPIKey) {
        super(client);

        this._id = data._id;
        this.key = data.key;
        this.owner = data.owner;
    }
}