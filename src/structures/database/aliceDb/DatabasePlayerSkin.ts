import { SkinPreview } from "@structures/skins/SkinPreview";
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
     * The name of the skin.
     */
    name: string;

    /**
     * The description of the skin.
     */
    description: string;

    /**
     * The URL to the skin.
     */
    url: string;

    /**
     * The previews of the skin.
     */
    previews?: SkinPreview;
}
