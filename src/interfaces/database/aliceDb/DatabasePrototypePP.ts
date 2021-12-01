import { Snowflake } from "discord.js";
import { PrototypePPEntry } from "@alice-interfaces/dpp/PrototypePPEntry";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents the prototype droid performance point (dpp) entry of an osu!droid account.
 */
export interface DatabasePrototypePP extends BaseDocument {
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
     * The prototype droid performance points (dpp) entries of the account.
     */
    pp: PrototypePPEntry[];

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
     * The UID of osu!droid accounts that are binded to the user.
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
}
