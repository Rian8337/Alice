import { DatabaseSupportTicket } from "@alice-structures/database/aliceDb/DatabaseSupportTicket";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { SupportTicket } from "@alice-database/utils/aliceDb/SupportTicket";
import { SupportTicketStatus } from "@alice-enums/ticket/SupportTicketStatus";
import { FindOptions } from "mongodb";
import { Snowflake } from "discord.js";

/**
 * A manager for the `supportticket` collection.
 */
export class SupportTicketCollectionManager extends DatabaseCollectionManager<
    DatabaseSupportTicket,
    SupportTicket
> {
    protected override readonly utilityInstance = SupportTicket;

    override get defaultDocument(): DatabaseSupportTicket {
        return {
            id: 0,
            author: "",
            createdAt: Date.now(),
            description: "",
            status: SupportTicketStatus.open,
            title: "",
        };
    }

    /**
     * Gets a support ticket by its ID.
     *
     * @param id The ID of the support ticket.
     * @returns The support ticket, `null` if not found.
     */
    getFromId(
        id: number,
        options?: FindOptions<DatabaseSupportTicket>,
    ): Promise<SupportTicket | null> {
        return this.getOne({ id: id }, options);
    }

    /**
     * Gets a new ticket ID for a user.
     *
     * @param userId The ID of the user.
     * @returns The ticket ID.
     */
    async getNewId(userId: Snowflake): Promise<number> {
        return (await this.collection.countDocuments({ author: userId })) + 1;
    }
}
