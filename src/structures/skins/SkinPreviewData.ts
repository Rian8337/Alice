import { Snowflake } from "discord.js";

/**
 * Represents data of a skin preview.
 */
export interface SkinPreviewData {
    /**
     * The ID of the message that stores the attachment.
     */
    messageId: Snowflake;

    /**
     * The URL to the attachment.
     */
    attachmentURL: string;
}
