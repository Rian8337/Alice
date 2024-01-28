import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SupportTicketStatus } from "@alice-enums/ticket/SupportTicketStatus";
import { Language } from "@alice-localization/base/Language";
import { SupportTicketLocalization } from "@alice-localization/database/utils/aliceDb/SupportTicket/SupportTicketLocalization";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { DatabaseSupportTicket } from "@alice-structures/database/aliceDb/DatabaseSupportTicket";
import { NormalEmbedOptions } from "@alice-structures/utils/NormalEmbedOptions";
import { Manager } from "@alice-utils/base/Manager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import {
    EmbedBuilder,
    Snowflake,
    TimestampStyles,
    time,
    userMention,
} from "discord.js";
import { ObjectId } from "mongodb";

/**
 * Represents a support ticket.
 */
export class SupportTicket extends Manager {
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
     * The date at which this ticket was created.
     */
    readonly createdAt: Date;

    /**
     * The status of this ticket.
     */
    readonly status: SupportTicketStatus;

    readonly _id?: ObjectId;

    private get dbManager() {
        return DatabaseManager.aliceDb.collections.supportTicket;
    }

    constructor(
        data: DatabaseSupportTicket = DatabaseManager.aliceDb?.collections
            .supportTicket.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.id = data.id;
        this.author = data.author;
        this.description = data.description;
        this.createdAt = new Date(data.createdAt);
        this.status = data.status;
        this.title = data.title;
    }

    /**
     * Closes this ticket.
     *
     * @param language The language of the user who performed this operation.
     * @returns An object containing information about the operation.
     */
    async close(language: Language = "en"): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (this.status === SupportTicketStatus.closed) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsClosed"),
            );
        }

        return this.dbManager.updateOne(
            {
                id: this.id,
            },
            { $set: { status: SupportTicketStatus.closed } },
        );
    }

    /**
     * Reopens this ticket.
     *
     * @param language The language of the user who performed this operation.
     * @returns An object containing information about the operation.
     */
    async reopen(language: Language = "en"): Promise<OperationResult> {
        // TODO: disallow reopen if ticket is too old
        const localization = this.getLocalization(language);

        if (this.status === SupportTicketStatus.open) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsOpen"),
            );
        }

        return this.dbManager.updateOne(
            {
                id: this.id,
            },
            { $set: { status: SupportTicketStatus.open } },
        );
    }

    /**
     * Creates an {@link EmbedBuilder} from this {@link SupportTicket}.
     */
    toEmbed(
        embedOptions?: NormalEmbedOptions,
        language: Language = "en",
    ): EmbedBuilder {
        const localization = this.getLocalization(language);

        return EmbedCreator.createNormalEmbed(embedOptions).setFields(
            {
                name: localization.getTranslation("embedAuthor"),
                value: `${userMention(this.author)} (${this.author})`,
                inline: true,
            },
            {
                name: localization.getTranslation("embedCreationDate"),
                value: time(this.createdAt, TimestampStyles.LongDateTime),
                inline: true,
            },
            {
                name: localization.getTranslation("embedStatus"),
                value: localization.getTranslation(
                    this.status === SupportTicketStatus.open
                        ? "embedTicketOpen"
                        : "embedTicketClosed",
                ),
                inline: true,
            },
            {
                name: localization.getTranslation("embedTicketTitle"),
                value: this.title,
            },
            {
                name: localization.getTranslation("embedTicketDescription"),
                value: this.description,
            },
        );
    }

    private getLocalization(language: Language) {
        return new SupportTicketLocalization(language);
    }
}
