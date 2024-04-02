import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";
import { RecalculationProgress } from "@alice-structures/dpp/RecalculationProgress";
import { DatabaseInGamePP } from "@alice-structures/database/aliceDb/DatabaseInGamePP";
import { PPEntry } from "@alice-structures/dpp/PPEntry";

/**
 * Represents the droid performance point (dpp) entry of an osu!droid account that corresponds
 * to the future in-game dpp system.
 */
export class InGamePP extends Manager {
    /**
     * The Discord ID bound to the osu!droid account.
     */
    discordid: Snowflake;

    /**
     * The epoch time at which the account is last
     * recalculated, in milliseconds.
     */
    lastUpdate: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;

    /**
     * The prototype droid performance points (dpp) entries of the account, mapped by their hash.
     */
    pp: Collection<string, PPEntry>;

    /**
     * The total droid performance points (dpp) of the account after recalculation.
     */
    pptotal: number;

    /**
     * The total droid performance points (dpp) of the account before recalculation.
     */
    prevpptotal: number;

    /**
     * The UID of the account.
     */
    uid: number;

    /**
     * The UID of osu!droid accounts that are bound to the user.
     *
     * A user can only bind up to 2 osu!droid accounts, therefore
     * the maximum length of this array will never exceed 2.
     */
    previous_bind: number[];

    /**
     * The username of the account.
     */
    username: string;

    /**
     * Whether this prototype entry has been calculated against the latest changes.
     */
    scanDone: boolean;

    /**
     * Progress of ongoing dpp calculation.
     */
    calculationInfo?: RecalculationProgress<PPEntry>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseInGamePP = DatabaseManager.aliceDb?.collections.inGamePP
            .defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.lastUpdate = data.lastUpdate;
        this.playc = data.playc;
        this.pp = ArrayHelper.arrayToCollection(data.pp ?? [], "hash");
        this.pptotal = data.pptotal;
        this.prevpptotal = data.prevpptotal;
        this.uid = data.uid;
        this.previous_bind = data.previous_bind ?? [];
        this.username = data.username;
        this.scanDone = data.scanDone;
    }
}
