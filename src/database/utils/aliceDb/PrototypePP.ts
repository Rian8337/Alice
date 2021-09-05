import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabasePrototypePP } from "@alice-interfaces/database/aliceDb/DatabasePrototypePP";
import { PrototypePPEntry } from "@alice-interfaces/dpp/PrototypePPEntry";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";

/**
 * Represents the prototype droid performance point (dpp) entry of an osu!droid account.
 */
export class PrototypePP extends Manager {
    /**
     * The Discord ID binded to the osu!droid account.
     */
    discordid: Snowflake;

    /**
     * The epoch time at which the account is last
     * recalculated, in milliseconds.
     */
    lastUpdate: number;

    /**
     * The prototype droid performance points (dpp) entries of the account, mapped by their hash.
     */
    pp: Collection<string, PrototypePPEntry>;

    /**
     * The total droid performance points (dpp) of the account after recalculation.
     */
    pptotal: number;

    /**
     * The UID of the account.
     */
    uid: number;

    /**
     * The username of the account.
     */
    username: string;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(data: DatabasePrototypePP = DatabaseManager.aliceDb.collections.prototypePP.defaultDocument) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.lastUpdate = data.lastUpdate;
        this.pp = ArrayHelper.arrayToCollection(data.pp ?? [], "hash");
        this.pptotal = data.pptotal;
        this.uid = data.uid;
        this.username = data.username;
    }
}