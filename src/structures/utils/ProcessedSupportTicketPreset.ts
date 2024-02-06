import { Snowflake } from "discord.js";

/**
 * Represents a ticket preset that has been processed by a processor.
 */
export interface ProcessedSupportTicketPreset {
    /**
     * The title of the processed ticket preset.
     */
    readonly title: string;

    /**
     * The description of the processed ticket preset.
     */
    readonly description: string;

    /**
     * Users who are assigned to the processed ticket preset.
     */
    readonly assignees?: Snowflake[];
}
