import { Snowflake } from "discord.js";
import { Tag } from "@alice-interfaces/commands/Tools/Tag";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents guild-specific tags.
 */
export interface DatabaseGuildTags extends BaseDocument {
    /**
     * The ID of the guild.
     */
    guildid: Snowflake;

    /**
     * The tags that the guild has.
     */
    tags: Tag[];

    /**
     * Whether this guild-specific tags has been scanned for empty tags.
     */
    emptyScanDone?: boolean;
};