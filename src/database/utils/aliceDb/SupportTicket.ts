import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SupportTicketStatus } from "@alice-enums/ticket/SupportTicketStatus";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Language } from "@alice-localization/base/Language";
import { SupportTicketLocalization } from "@alice-localization/database/utils/aliceDb/SupportTicket/SupportTicketLocalization";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { DatabaseSupportTicket } from "@alice-structures/database/aliceDb/DatabaseSupportTicket";
import { Manager } from "@alice-utils/base/Manager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import {
    ActionRowBuilder,
    AnyThreadChannel,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    ForumChannel,
    Message,
    Snowflake,
    TextChannel,
    TimestampStyles,
    channelLink,
    messageLink,
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
     * The IDs of people who are assigned to address this ticket.
     */
    assigneeIds: Snowflake[];

    /**
     * The Discord ID of the author of this ticket.
     */
    readonly authorId: Snowflake;

    /**
     * The ID of the guild channel of this ticket.
     */
    guildChannelId: Snowflake;

    /**
     * The ID of the thread channel of this ticket.
     */
    threadChannelId: Snowflake;

    /**
     * The ID of the "control panel" message of this ticket in the thread channel.
     */
    controlPanelMessageId: Snowflake;

    /**
     * The ID of the message that tracks this ticket in the tracking text channel.
     */
    readonly trackingMessageId: Snowflake;

    /**
     * The title of this ticket.
     */
    title: string;

    /**
     * The description of this ticket.
     */
    description: string;

    /**
     * The date at which this ticket was created.
     */
    readonly createdAt: Date;

    /**
     * The status of this ticket.
     */
    status: SupportTicketStatus;

    /**
     * Whether this ticket is open.
     */
    get isOpen() {
        return this.status === SupportTicketStatus.open;
    }

    /**
     * Whether this ticket is closed.
     */
    get isClosed() {
        return this.status === SupportTicketStatus.closed;
    }

    /**
     * The URL to the thread channel containing this ticket.
     */
    get threadChannelURL() {
        return channelLink(this.threadChannelId, Constants.mainServer);
    }

    /**
     * The URL to the staff tracking message of this ticket.
     */
    get trackingMessageURL() {
        return messageLink(
            Constants.supportTicketStaffChannel,
            this.trackingMessageId,
            Constants.mainServer,
        );
    }

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
        this.assigneeIds = data.assigneeIds ?? [];
        this.authorId = data.authorId;
        this.description = data.description;
        this.guildChannelId = data.guildChannelId;
        this.controlPanelMessageId = data.controlPanelMessageId;
        this.createdAt = new Date(data.createdAt);
        this.status = data.status;
        this.title = data.title;
        this.threadChannelId = data.threadChannelId;
        this.trackingMessageId = data.trackingMessageId;
    }

    /**
     * Checks whether a user can modify this ticket.
     *
     * @param userId The ID of the user.
     * @returns Whether the user can modify this ticket.
     */
    canModify(userId: Snowflake) {
        return Config.botOwners.includes(userId) || this.authorId === userId;
    }

    /**
     * Closes this ticket.
     *
     * @param language The language of the user who performed this operation.
     * @returns An object containing information about the operation.
     */
    async close(language: Language = "en"): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (!this.isOpen) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsNotOpen"),
            );
        }

        const result = await this.dbManager.updateOne(
            {
                id: this.id,
                authorId: this.authorId,
            },
            { $set: { status: SupportTicketStatus.closed } },
        );

        if (result.failed()) {
            return result;
        }

        await this.updateMessages(language);

        return this.createOperationResult(true);
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

        if (this.isOpen) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsOpen"),
            );
        }

        const result = await this.dbManager.updateOne(
            {
                id: this.id,
                authorId: this.authorId,
            },
            { $set: { status: SupportTicketStatus.open } },
        );

        if (result.failed()) {
            return result;
        }

        await this.updateMessages(language);

        return this.createOperationResult(true);
    }

    /**
     * Moves this ticket to a channel.
     *
     * @param channel The channel to move this ticket to.
     * @param language The language of the user who performed this operation. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async move(
        channel: TextChannel | ForumChannel,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (!this.isOpen) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsNotOpen"),
            );
        }

        const currentThreadChannel = await this.getThreadChannel();
        if (!currentThreadChannel) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cannotGetTicketMessage"),
            );
        }

        const newThreadChannel = await channel.threads
            .create({
                name: `Ticket #${this.id} ${this.authorId}`,
                message: {
                    embeds: [this.toUserEmbed(language)],
                    components: this.createUserControlPanelButtons(language),
                },
                invitable: false,
                type:
                    channel instanceof TextChannel
                        ? ChannelType.PrivateThread
                        : ChannelType.PublicThread,
            })
            .catch(() => null);
        if (!newThreadChannel) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cannotCreateThread"),
            );
        }

        const result = await this.dbManager.updateOne(
            {
                id: this.id,
            },
            {
                $set: {
                    guildChannelId: channel.id,
                    threadChannelId: newThreadChannel.id,
                    controlPanelMessageId: newThreadChannel.id,
                },
            },
        );

        if (result.failed()) {
            await newThreadChannel.delete("Ticket movement failed");

            return result;
        }

        await currentThreadChannel.send({
            content: MessageCreator.createWarn(
                localization.getTranslation("ticketMovedNotice"),
                currentThreadChannel.toString(),
            ),
        });
        await currentThreadChannel.setLocked(true, "Ticket moved");

        this.guildChannelId = channel.id;
        this.threadChannelId = newThreadChannel.id;
        // Starter message ID = thread ID
        this.controlPanelMessageId = newThreadChannel.id;

        return this.createOperationResult(
            await this.updateMessages(language),
            localization.getTranslation("cannotGetTicketMessage"),
        );
    }

    /**
     * Assigns a user to this ticket.
     *
     * @param userId The ID of the user.
     * @param language The language of the user who performed this operation. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async assign(
        userId: Snowflake,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (!this.isOpen) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsNotOpen"),
            );
        }

        if (this.assigneeIds.includes(userId)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("userIsAlreadyAssigned"),
            );
        }

        const result = await this.dbManager.updateOne(
            {
                id: this.id,
                authorId: this.authorId,
            },
            {
                $addToSet: {
                    assigneeIds: userId,
                },
            },
        );

        if (result.failed()) {
            return result;
        }

        this.assigneeIds.push(userId);

        if (!(await this.updateMessages(language))) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cannotGetTicketMessage"),
            );
        }

        return result;
    }

    /**
     * Unassigns a user to this ticket.
     *
     * @param userId The ID of the user.
     * @param language The language of the user who performed this operation. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async unassign(
        userId: Snowflake,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (!this.isOpen) {
            return this.createOperationResult(
                false,
                localization.getTranslation("ticketIsNotOpen"),
            );
        }

        if (!this.assigneeIds.includes(userId)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("userIsNotAssigned"),
            );
        }

        const result = await this.dbManager.updateOne(
            {
                id: this.id,
                authorId: this.authorId,
            },
            {
                $pull: {
                    assigneeIds: userId,
                },
            },
        );

        if (result.failed()) {
            return result;
        }

        this.assigneeIds.splice(this.assigneeIds.indexOf(userId), 1);

        if (!(await this.updateMessages(language))) {
            return this.createOperationResult(
                false,
                localization.getTranslation("cannotGetTicketMessage"),
            );
        }

        return result;
    }

    /**
     * Creates an {@link EmbedBuilder} from this {@link SupportTicket} for the user thread channel.
     *
     * @param language The language to create for. Defaults to English.
     */
    toUserEmbed(language: Language = "en"): EmbedBuilder {
        const localization = this.getLocalization(language);

        return EmbedCreator.createNormalEmbed({
            color: "LuminousVividPink",
        }).setFields(
            {
                name: localization.getTranslation("embedAuthor"),
                value: `${userMention(this.authorId)} (${this.authorId})`,
                inline: true,
            },
            {
                name: localization.getTranslation("embedCreationDate"),
                value: time(this.createdAt, TimestampStyles.LongDateTime),
                inline: true,
            },
            {
                name: localization.getTranslation("embedStatus"),
                value: this.statusToString(language),
                inline: true,
            },
            {
                name: localization.getTranslation("embedTicketAssignees"),
                value:
                    this.assigneeIds
                        .map((v) => `- ${userMention(v)} (${v})`)
                        .join("\n") || localization.getTranslation("none"),
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

    /**
     * Creates an {@link EmbedBuilder} from this {@link SupportTicket} for the user thread channel.
     */
    toStaffEmbed(): EmbedBuilder {
        const localization = this.getLocalization("en");

        return EmbedCreator.createNormalEmbed({
            color: "Orange",
        }).setFields(
            {
                name: localization.getTranslation("embedAuthor"),
                value: `${userMention(this.authorId)} (${this.authorId})`,
                inline: true,
            },
            {
                name: localization.getTranslation("embedCreationDate"),
                value: time(this.createdAt, TimestampStyles.LongDateTime),
                inline: true,
            },
            {
                name: localization.getTranslation("embedStatus"),
                value: this.statusToString(),
                inline: true,
            },
            {
                name: localization.getTranslation("embedTicketAssignees"),
                value:
                    this.assigneeIds
                        .map((v) => `- ${userMention(v)} (${v})`)
                        .join("\n") || localization.getTranslation("none"),
            },
            {
                name: localization.getTranslation("embedTicketTitle"),
                value: this.title,
            },
            {
                name: localization.getTranslation("embedTicketDescription"),
                // Truncate the description for staff embeds.
                value:
                    this.description.length > 250
                        ? this.description.substring(0, 248) + "..."
                        : this.description,
            },
        );
    }

    /**
     * Creates buttons for the user "control panel" message.
     *
     * @param language The language to create the buttons for.
     * @returns An array of {@link ActionRowBuilder} containing the buttons.
     */
    createUserControlPanelButtons(
        language: Language = "en",
    ): ActionRowBuilder<ButtonBuilder>[] {
        const localization = this.getLocalization(language);
        const rowBuilder = new ActionRowBuilder<ButtonBuilder>();

        rowBuilder.addComponents(
            new ButtonBuilder()
                .setCustomId(`editSupportTicket#${this.threadChannelId}`)
                .setEmoji(Symbols.pencil)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!this.isOpen)
                .setLabel(
                    localization.getTranslation(
                        "userControlPanelEditButtonLabel",
                    ),
                ),
        );

        if (this.isOpen) {
            rowBuilder.addComponents(
                new ButtonBuilder()
                    .setCustomId(`closeSupportTicket#${this.threadChannelId}`)
                    .setEmoji(Symbols.inboxTray)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(
                        localization.getTranslation(
                            "userControlPanelCloseButtonLabel",
                        ),
                    ),
            );
        } else if (this.isClosed) {
            rowBuilder.addComponents(
                new ButtonBuilder()
                    .setCustomId(`reopenSupportTicket#${this.threadChannelId}`)
                    .setEmoji(Symbols.outboxTray)
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(
                        localization.getTranslation(
                            "userControlPanelOpenButtonLabel",
                        ),
                    ),
            );
        }

        rowBuilder.addComponents(
            new ButtonBuilder()
                .setEmoji(Symbols.magnifyingGlassTiltedRight)
                .setStyle(ButtonStyle.Link)
                .setLabel(
                    localization.getTranslation(
                        "userControlPanelTrackingMessageButtonLabel",
                    ),
                )
                .setURL(this.trackingMessageURL),
        );

        return [rowBuilder];
    }

    /**
     * Creates buttons for the staff tracking message.
     *
     * @returns An {@link ActionRowBuilder} containing the buttons.
     */
    createTrackingMessageButtons(): ActionRowBuilder<ButtonBuilder>[] {
        const localization = this.getLocalization("en");
        const firstRowBuilder = new ActionRowBuilder<ButtonBuilder>();
        const secondRowBuilder = new ActionRowBuilder<ButtonBuilder>();

        firstRowBuilder.addComponents(
            new ButtonBuilder()
                .setCustomId(`assignSupportTicket#${this.threadChannelId}`)
                .setEmoji(Symbols.bookmark)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!this.isOpen)
                .setLabel(
                    localization.getTranslation(
                        "trackingMessageAssignButtonLabel",
                    ),
                ),
            new ButtonBuilder()
                .setCustomId(`unassignSupportTicket#${this.threadChannelId}`)
                .setEmoji(Symbols.label)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!this.isOpen)
                .setLabel(
                    localization.getTranslation(
                        "trackingMessageUnassignButtonLabel",
                    ),
                ),
            new ButtonBuilder()
                .setCustomId(`editSupportTicket#${this.threadChannelId}`)
                .setEmoji(Symbols.pencil)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!this.isOpen)
                .setLabel(
                    localization.getTranslation(
                        "userControlPanelEditButtonLabel",
                    ),
                ),
        );

        if (this.isOpen) {
            firstRowBuilder.addComponents(
                new ButtonBuilder()
                    .setCustomId(`closeSupportTicket#${this.threadChannelId}`)
                    .setEmoji(Symbols.inboxTray)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel(
                        localization.getTranslation(
                            "userControlPanelCloseButtonLabel",
                        ),
                    ),
            );
        } else if (this.isClosed) {
            firstRowBuilder.addComponents(
                new ButtonBuilder()
                    .setCustomId(`reopenSupportTicket#${this.threadChannelId}`)
                    .setEmoji(Symbols.outboxTray)
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(
                        localization.getTranslation(
                            "userControlPanelOpenButtonLabel",
                        ),
                    ),
            );
        }

        // TODO: transfer button

        secondRowBuilder.addComponents(
            new ButtonBuilder()
                .setEmoji(Symbols.magnifyingGlassTiltedRight)
                .setStyle(ButtonStyle.Link)
                .setLabel(
                    localization.getTranslation(
                        "trackingMessageTicketChannelButtonLabel",
                    ),
                )
                .setURL(this.threadChannelURL),
        );

        return [firstRowBuilder, secondRowBuilder];
    }

    /**
     * Converts the status of this ticket to its string equivalent.
     *
     * @param language The language to get the string from.
     * @returns The string representation.
     */
    statusToString(language: Language = "en") {
        const localization = this.getLocalization(language);

        switch (this.status) {
            case SupportTicketStatus.open:
                return localization.getTranslation("embedTicketOpen");
            case SupportTicketStatus.closed:
                return localization.getTranslation("embedTicketClosed");
        }
    }

    private async getThreadChannel(): Promise<AnyThreadChannel | null> {
        const guild = await this.client.guilds
            .fetch(Constants.mainServer)
            .catch(() => null);

        if (!guild) {
            return null;
        }

        const channel = await guild.channels
            .fetch(this.guildChannelId)
            .catch(() => null);

        if (
            !channel ||
            (channel.type !== ChannelType.GuildText &&
                channel.type !== ChannelType.GuildForum)
        ) {
            return null;
        }

        return channel.threads.fetch(this.threadChannelId).catch(() => null);
    }

    private async updateMessages(language: Language = "en"): Promise<boolean> {
        const controlPanelMessage = await this.getUserControlPanelMessage();
        if (!controlPanelMessage) {
            return false;
        }

        await controlPanelMessage.edit({
            embeds: [this.toUserEmbed(language)],
            components: this.createUserControlPanelButtons(language),
        });

        const trackingMessage = await this.getTrackingMessage();
        if (!trackingMessage) {
            return false;
        }

        await trackingMessage.edit({
            embeds: [this.toStaffEmbed()],
            components: this.createTrackingMessageButtons(),
        });

        return true;
    }

    private async getUserControlPanelMessage(): Promise<Message<true> | null> {
        const thread = await this.getThreadChannel();

        return (
            thread?.messages
                .fetch(this.controlPanelMessageId)
                .catch(() => null) ?? null
        );
    }

    private async getTrackingMessage(): Promise<Message<true> | null> {
        const guild = await this.client.guilds
            .fetch(Constants.mainServer)
            .catch(() => null);

        if (!guild) {
            return null;
        }

        const channel = await guild.channels
            .fetch(Constants.supportTicketStaffChannel)
            .catch(() => null);

        if (!(channel instanceof TextChannel)) {
            return null;
        }

        return channel.messages.fetch(this.trackingMessageId).catch(() => null);
    }

    private getLocalization(language: Language) {
        return new SupportTicketLocalization(language);
    }
}
