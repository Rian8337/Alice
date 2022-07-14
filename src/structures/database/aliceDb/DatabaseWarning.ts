import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a user's warnings.
 */
export interface DatabaseWarning extends BaseDocument {
    /**
     * The ID of this warning.
     */
    globalId: string;

    /**
     * The ID of the guild this warning was issued in.
     */
    guildId: Snowflake;

    /**
     * The ID of the user.
     */
    discordId: Snowflake;

    /**
     * The ID of the channel this warning was issued in.
     */
    channelId: Snowflake;

    /**
     * The ID of the user that issued this warning.
     */
    issuerId: Snowflake;

    /**
     * The epoch time at which this warning was issued, in seconds.
     */
    creationDate: number;

    /**
     * The epoch time at which this warning expires, in seconds.
     */
    expirationDate: number;

    /**
     * The amount of points this warning has.
     */
    points: number;

    /**
     * The reason this warning was issued.
     */
    reason: string;
}
