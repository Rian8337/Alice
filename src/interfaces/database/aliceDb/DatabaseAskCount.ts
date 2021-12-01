import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents an information about how many times a user has asked the bot via 8ball.
 */
export interface DatabaseAskCount extends BaseDocument {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * The amount of times the user has asked the bot via 8ball.
     */
    count: number;
}
