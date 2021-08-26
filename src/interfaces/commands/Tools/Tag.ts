import { Snowflake } from "discord.js";

/**
 * Represents a tag.
 */
export interface Tag {
    /**
     * The Discord ID of the tag author.
     */
    author: Snowflake;

    /**
     * The name of the tag.
     */
    name: string;

    /**
     * The epoch time at which the tag was created, in milliseconds.
     */
    date: number;

    /**
     * The content of the tag.
     */
    content: string;

    /**
     * The ID of the message that contains the attachments of the tag.
     */
    attachment_message: Snowflake;

    /**
     * The URL of the attachments of the tag.
     */
    attachments: string[];
};