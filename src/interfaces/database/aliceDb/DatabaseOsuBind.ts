import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a Discord user who has an osu! account binded.
 */
export interface DatabaseOsuBind extends BaseDocument {
    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    // TODO: change this to user ID
    /**
     * The osu! username the user is binded to.
     */
    username: string;
}
