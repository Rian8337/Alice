import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents an information about a Discord user's osu!/osu!droid skin.
 */
export interface DatabasePlayerSkin extends BaseDocument {
    /**
     * The ID of the user.
     */
    discordid: Snowflake;

    /**
     * The URL to the user's skin.
     */
    skin: string;
}
