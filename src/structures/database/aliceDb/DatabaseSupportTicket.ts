import { SupportTicketStatus } from "@alice-enums/ticket/SupportTicketStatus";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a support ticket.
 */
export interface DatabaseSupportTicket extends BaseDocument {
    /**
     * The ID of this ticket.
     */
    readonly id: number;

    /**
     * The IDs of people who are assigned to address this ticket.
     */
    readonly assigneeIds: Snowflake[];

    /**
     * The Discord ID of the author of this ticket.
     */
    readonly authorId: Snowflake;

    /**
     * The ID of the guild channel of this ticket.
     */
    readonly guildChannelId: Snowflake;

    /**
     * The ID of the thread channel of this ticket.
     */
    readonly threadChannelId: Snowflake;

    /**
     * The ID of the "control panel" message of this ticket in the thread channel.
     */
    readonly controlPanelMessageId: Snowflake;

    /**
     * The ID of the message that tracks this ticket in the tracking text channel.
     *
     * It is also the ID of the staff thread channel that tracks this ticket in
     * the tracking text channel.
     */
    readonly trackingMessageId: Snowflake;

    /**
     * The title of this ticket.
     */
    readonly title: string;

    /**
     * The description of this ticket.
     */
    readonly description: string;

    /**
     * The epoch time at which this ticket was created, in milliseconds.
     */
    readonly createdAt: Date;

    /**
     * The status of this ticket.
     */
    readonly status: SupportTicketStatus;

    /**
     * The ID of the ticket preset, if this ticket was made from a preset.
     */
    readonly presetId?: number;
}
