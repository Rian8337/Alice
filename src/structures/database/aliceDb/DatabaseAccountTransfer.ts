import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents an osu!droid account transfer of a user.
 */
export interface DatabaseAccountTransfer extends BaseDocument {
    /**
     * The Discord ID of the user.
     */
    readonly discordId: Snowflake;

    /**
     * The uid of the osu!droid account to transfer scores to.
     */
    readonly transferUid: number;

    /**
     * The list of uids of osu!droid accounts to transfer scores from.
     */
    readonly transferList: number[];

    /**
     * Whether the transfer is done.
     */
    transferDone?: boolean;
}
