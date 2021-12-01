import { DatabaseManager } from "@alice-database/DatabaseManager";
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

    constructor(
        data: DatabaseDPPAPIKey = DatabaseManager.aliceDb?.collections.dppAPIKey
            .defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.key = data.key;
        this.owner = data.owner;
    }
}
