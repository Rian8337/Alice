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
     * The Discord ID of the author of this ticket.
     */
    readonly author: Snowflake;

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
    readonly createdAt: number;

    /**
     * The status of this ticket.
     */
    readonly status: SupportTicketStatus;
}
