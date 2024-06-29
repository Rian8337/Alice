import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { FancyApplicationStatus } from "@alice-enums/utils/FancyApplicationStatus";
import { Language } from "@alice-localization/base/Language";
import { FancyApplicationLocalization } from "@alice-localization/database/utils/aliceDb/FancyApplication/FancyApplicationLocalization";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { DatabaseFancyApplication } from "@alice-structures/database/aliceDb/DatabaseFancyApplication";
import { FancyApplicationVote } from "@alice-structures/utils/FancyApplicationVote";
import { Manager } from "@alice-utils/base/Manager";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import {
    ActionRow,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonComponent,
    EmbedBuilder,
    Snowflake,
    userMention,
} from "discord.js";
import { ObjectId, UpdateFilter } from "mongodb";

/**
 * Represents a fancy lounge application.
 */
export class FancyApplication
    extends Manager
    implements DatabaseFancyApplication
{
    readonly discordId: Snowflake;
    readonly createdAt: Date;
    status: FancyApplicationStatus;
    readonly applicationApprovalMessageId: Snowflake;
    vote?: FancyApplicationVote;
    rejectReason?: string;
    readonly _id?: ObjectId;

    private get db() {
        return DatabaseManager.aliceDb.collections.fancyApplication;
    }

    constructor(
        data: DatabaseFancyApplication = DatabaseManager.aliceDb?.collections
            .fancyApplication.defaultDocument,
    ) {
        super();

        this._id = data._id;
        this.discordId = data.discordId;
        this.createdAt = data.createdAt;
        this.status = data.status;
        this.applicationApprovalMessageId = data.applicationApprovalMessageId;
        this.vote = data.vote;
    }

    /**
     * Registers a vote.
     *
     * @param userId The ID of the user.
     * @param answer The vote.
     * @param reason The reason for the vote.
     * @returns An object containing information about the operation.
     */
    async registerVote(
        userId: Snowflake,
        answer: boolean,
        reason?: string,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (!this.vote) {
            return this.createOperationResult(
                false,
                localization.getTranslation("voteNotStarted"),
            );
        }

        if (this.vote.endsAt < new Date()) {
            return this.createOperationResult(
                false,
                localization.getTranslation("voteHasFinished"),
            );
        }

        const choiceIndex = this.vote.votes.findIndex(
            (v) => v.discordId === userId,
        );

        if (choiceIndex === -1) {
            this.vote.votes.push({
                discordId: userId,
                answer: answer,
                reason: reason,
            });

            return this.db.updateOne(
                { discordId: userId },
                { $push: { votes: this.vote.votes.at(-1) } },
            );
        } else {
            this.vote.votes[choiceIndex].answer = true;

            const query: UpdateFilter<DatabaseFancyApplication> = {};

            Object.defineProperty(query, `vote.votes.${choiceIndex}.answer`, {
                value: true,
                configurable: true,
                enumerable: true,
                writable: true,
            });

            return this.db.updateOne({ discordId: userId }, query);
        }
    }

    /**
     * Cancels this application.
     *
     * @param language The language of the user. Defaults to English.
     */
    async cancel(language: Language = "en"): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (
            this.status !== FancyApplicationStatus.pendingApproval &&
            this.status !== FancyApplicationStatus.inReview &&
            this.status !== FancyApplicationStatus.inVote
        ) {
            return this.createOperationResult(
                false,
                localization.getTranslation("applicationNotCancellable"),
            );
        }

        if (!(await this.invalidateApprovalMessage())) {
            return this.createOperationResult(
                false,
                localization.getTranslation("channelNotFound"),
            );
        }

        if (!(await this.invalidateVoteMessage())) {
            return this.createOperationResult(
                false,
                localization.getTranslation("channelNotFound"),
            );
        }

        return this.db.updateOne(
            { discordId: this.discordId },
            {
                $set: { status: FancyApplicationStatus.cancelled },
                $unset: { vote: "" },
            },
        );
    }

    /**
     * Rejects this application in a pending approval state.
     *
     * @param reason The reason for rejecting the application.
     * @param language The language to use for rejection message. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async rejectPendingApproval(
        reason: string,
        language: Language = "en",
    ): Promise<OperationResult> {
        const localization = this.getLocalization(language);

        if (this.status !== FancyApplicationStatus.pendingApproval) {
            return this.createOperationResult(
                false,
                localization.getTranslation("applicationNotRejectable"),
            );
        }

        if (!(await this.invalidateApprovalMessage())) {
            return this.createOperationResult(
                false,
                localization.getTranslation("channelNotFound"),
            );
        }

        this.status = FancyApplicationStatus.rejected;
        this.rejectReason = reason;

        const user = await this.client.users.fetch(this.discordId);

        const newApplicationTime = Math.floor(
            new Date(this.createdAt.getTime() + 604800000).getTime() / 1000,
        );

        try {
            await user.send({
                content: MessageCreator.createReject(
                    localization.getTranslation("userApplicationRejected"),
                    `<t:${newApplicationTime}:F>`,
                    `<t:${newApplicationTime}:R>`,
                ),
                embeds: [this.toEmbed(language)],
            });
        } catch {
            /* empty */
        }

        return this.db.updateOne(
            { discordId: this.discordId },
            { $set: { status: this.status, rejectReason: this.rejectReason } },
        );
    }

    /**
     * Ends the vote of this application.
     */
    async endVote(): Promise<OperationResult> {
        const localization = this.getLocalization("en");

        if (!this.vote) {
            return this.createOperationResult(
                false,
                localization.getTranslation("voteNotStarted"),
            );
        }

        const guild = await this.client.guilds.fetch(Constants.mainServer);
        const loungeChannel = await guild.channels.fetch(
            Constants.loungeChannel,
        );

        if (!loungeChannel?.isTextBased()) {
            return this.createOperationResult(
                false,
                localization.getTranslation("channelNotFound"),
            );
        }

        if (this.vote.votes.some((v) => !v.answer)) {
            const staffChannel = await guild.channels.fetch(
                Constants.staffChannel,
            );

            if (!staffChannel?.isTextBased()) {
                return this.createOperationResult(
                    false,
                    localization.getTranslation("channelNotFound"),
                );
            }

            await staffChannel.send({
                components: [],
                content: MessageCreator.createWarn(
                    localization.getTranslation("disagreeVotesExists"),
                    userMention(this.discordId),
                ),
            });
        }

        const message = await loungeChannel.messages.fetch(this.vote.messageId);

        await message.unpin("Vote finished");

        return this.db.updateOne(
            { discordId: this.discordId },
            {
                $set: {
                    status: FancyApplicationStatus.inReview,
                },
            },
        );
    }

    /**
     * Converts this {@link FancyApplication} to an embed.
     *
     * @param language The language to use. Defaults to English.
     */
    toEmbed(language: Language = "en"): EmbedBuilder {
        const localization = this.getLocalization(language);

        const embed = EmbedCreator.createNormalEmbed({
            color: "Fuchsia",
        });

        embed
            .setTitle(localization.getTranslation("applicationEmbedTitle"))
            .setTimestamp(this.createdAt);

        let description = StringHelper.formatString(
            localization.getTranslation("applicationEmbedDescriptionStatus"),
            this.statusToString(language),
        );

        if (this.rejectReason) {
            description += "\n";
            description += StringHelper.formatString(
                localization.getTranslation(
                    "applicationEmbedDescriptionReason",
                ),
                this.rejectReason,
            );
        }

        embed.setDescription(description);

        return embed;
    }

    private async invalidateApprovalMessage(): Promise<boolean> {
        if (this.status !== FancyApplicationStatus.pendingApproval) {
            return true;
        }

        const guild = await this.client.guilds.fetch(Constants.mainServer);
        const staffChannel = await guild.channels.fetch(Constants.staffChannel);

        if (!staffChannel?.isTextBased()) {
            return false;
        }

        const approvalMessage = await staffChannel.messages.fetch(
            this.applicationApprovalMessageId,
        );

        await approvalMessage.edit({
            components: approvalMessage.components.map((row) => {
                const rowBuilder = ActionRowBuilder.from<ButtonBuilder>(
                    row as ActionRow<ButtonComponent>,
                );

                rowBuilder.setComponents(
                    rowBuilder.components.map((component) => {
                        const componentBuilder = ButtonBuilder.from(component);

                        componentBuilder.setDisabled(true);

                        return componentBuilder;
                    }),
                );

                return rowBuilder;
            }),
            embeds: approvalMessage.embeds,
        });

        return true;
    }

    private async invalidateVoteMessage(): Promise<boolean> {
        if (!this.vote || this.status !== FancyApplicationStatus.inVote) {
            return true;
        }

        const guild = await this.client.guilds.fetch(Constants.mainServer);
        const loungeChannel = await guild.channels.fetch(
            Constants.loungeChannel,
        );

        if (!loungeChannel?.isTextBased()) {
            return false;
        }

        const voteMessage = await loungeChannel.messages.fetch(
            this.vote.messageId,
        );

        await voteMessage.edit({
            components: voteMessage.components.map((row) => {
                const rowBuilder = ActionRowBuilder.from<ButtonBuilder>(
                    row as ActionRow<ButtonComponent>,
                );

                rowBuilder.setComponents(
                    rowBuilder.components.map((component) => {
                        const componentBuilder = ButtonBuilder.from(component);

                        componentBuilder.setDisabled(true);

                        return componentBuilder;
                    }),
                );

                return rowBuilder;
            }),
            embeds: voteMessage.embeds,
        });

        return true;
    }

    private statusToString(language: Language = "en"): string {
        const localization = this.getLocalization(language);

        switch (this.status) {
            case FancyApplicationStatus.pendingApproval:
                return localization.getTranslation(
                    "applicationStatusPendingApproval",
                );
            case FancyApplicationStatus.inVote:
                return localization.getTranslation("applicationStatusInVote");
            case FancyApplicationStatus.inReview:
                return localization.getTranslation("applicationStatusInReview");
            case FancyApplicationStatus.cancelled:
                return localization.getTranslation(
                    "applicationStatusCancelled",
                );
            case FancyApplicationStatus.rejected:
                return localization.getTranslation("applicationStatusRejected");
            case FancyApplicationStatus.accepted:
                return localization.getTranslation("applicationStatusAccepted");
        }
    }

    private getLocalization(language: Language): FancyApplicationLocalization {
        return new FancyApplicationLocalization(language);
    }
}
