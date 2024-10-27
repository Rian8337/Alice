import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";
import { RecalculationProgress } from "@structures/dpp/RecalculationProgress";
import { PPEntry } from "@structures/dpp/PPEntry";

/**
 * Represents the droid performance point (dpp) entry of an osu!droid account that corresponds
 * to the future in-game dpp system.
 */
export interface DatabaseInGamePP extends BaseDocument {
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
     * The droid performance points (dpp) entries of the account.
     */
    pp: PPEntry[];

    /**
     * The total droid performance points (dpp) of the account after recalculation.
     */
    pptotal: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;

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
}
