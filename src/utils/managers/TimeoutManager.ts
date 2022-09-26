import {
    GuildBasedChannel,
    GuildMember,
    EmbedBuilder,
    RepliableInteraction,
    Snowflake,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PunishmentManager } from "./PunishmentManager";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { LoungeLockManager } from "./LoungeLockManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Constants } from "@alice-core/Constants";
import { Language } from "@alice-localization/base/Language";
import { TimeoutManagerLocalization } from "@alice-localization/utils/managers/TimeoutManager/TimeoutManagerLocalization";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PunishmentManagerLocalization } from "@alice-localization/utils/managers/PunishmentManager/PunishmentManagerLocalization";

/**
 * A manager for timeouts.
 */
export abstract class TimeoutManager extends PunishmentManager {
    /**
     * Initializes the manager.
     */
    static override init(): void {
        this.punishmentDb =
            DatabaseManager.aliceDb.collections.guildPunishmentConfig;
    }

    /**
     * Adds a timeout.
     *
     * This will also send a log to the guild's log channel.
     *
     * @param interaction The interaction that triggered the timeout.
     * @param member The guild member to timeout.
     * @param reason Reason for timeout.
     * @param duration The duration to timeout the user for, in seconds.
     * @param language The locale of the user who attempted to mute the guild member.
     * @param channelId The channel where the user was timeouted. Defaults to the interaction's channel.
     * @returns An object containing information about the operation.
     */
    static async addTimeout(
        interaction: RepliableInteraction,
        member: GuildMember,
        reason: string,
        duration: number,
        language: Language = "en",
        channelId: Snowflake = interaction.channelId!
    ): Promise<OperationResult> {
        const localization: TimeoutManagerLocalization =
            this.getLocalization(language);

        if (this.isUserTimeouted(member)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("userAlreadyTimeouted")
            );
        }

        if (await this.userIsImmune(member)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("userImmuneToTimeout")
            );
        }

        if (isNaN(duration)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("invalidTimeoutDuration")
            );
        }

        if (!NumberHelper.isNumberInRange(duration, 30, 28 * 86400, true)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("timeoutDurationOutOfRange")
            );
        }

        if (
            !(await this.userCanTimeout(
                <GuildMember>interaction.member,
                duration
            ))
        ) {
            return this.createOperationResult(
                false,
                StringHelper.formatString(
                    localization.getTranslation("notEnoughPermissionToTimeout"),
                    DateTimeFormatHelper.secondsToDHMS(duration, language)
                )
            );
        }

        if (reason.length > 1500) {
            return this.createOperationResult(
                false,
                localization.getTranslation("timeoutReasonTooLong")
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await this.punishmentDb.getGuildConfig(member.guild);

        const punishmentManagerLocalization: PunishmentManagerLocalization =
            this.getPunishmentManagerLocalization(language);

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                punishmentManagerLocalization.getTranslation(
                    this.logChannelNotFoundReject
                )
            );
        }

        const logChannel: GuildBasedChannel | null =
            await guildConfig.getGuildLogChannel(member.guild);

        if (!logChannel?.isTextBased()) {
            return this.createOperationResult(
                false,
                punishmentManagerLocalization.getTranslation(
                    this.logChannelNotValidReject
                )
            );
        }

        await member.timeout(duration * 1000, reason);

        const logLocalization: TimeoutManagerLocalization =
            new TimeoutManagerLocalization("en");

        const timeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()!,
            })
            .setTitle(logLocalization.getTranslation("timeoutExecuted"))
            .setFooter({
                text: `${logLocalization.getTranslation("userId")}: ${
                    member.id
                } | ${logLocalization.getTranslation(
                    "channelId"
                )}: ${channelId}`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `**${member} ${StringHelper.formatString(
                    logLocalization.getTranslation("inChannel"),
                    `<#${channelId}>`
                )}: ${DateTimeFormatHelper.secondsToDHMS(
                    duration,
                    language
                )}**\n\n` +
                    `=========================\n\n` +
                    `**${logLocalization.getTranslation("reason")}**:\n` +
                    reason
            );

        const userLocalization: TimeoutManagerLocalization =
            this.getLocalization(
                await CommandHelper.getUserPreferredLocale(member.id)
            );

        const userTimeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()!,
            })
            .setTitle(userLocalization.getTranslation("timeoutExecuted"))
            .setFooter({
                text: `${userLocalization.getTranslation("userId")}: ${
                    member.id
                } | ${userLocalization.getTranslation(
                    "channelId"
                )}: ${channelId}`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `**${member} ${StringHelper.formatString(
                    userLocalization.getTranslation("inChannel"),
                    `<#${channelId}>`
                )}: ${DateTimeFormatHelper.secondsToDHMS(
                    duration,
                    userLocalization.language
                )}**\n\n` +
                    `=========================\n\n` +
                    `**${userLocalization.getTranslation("reason")}**:\n` +
                    reason
            );

        try {
            await this.notifyMember(
                member,
                StringHelper.formatString(
                    userLocalization.getTranslation("timeoutUserNotification"),
                    DateTimeFormatHelper.secondsToDHMS(
                        duration,
                        userLocalization.language
                    ),
                    reason
                ),
                userTimeoutEmbed
            );
        } catch {
            interaction.channel!.send({
                content: MessageCreator.createWarn(
                    `A user has been timeouted, but their DMs are locked. The user will be timeouted for \`${DateTimeFormatHelper.secondsToDHMS(
                        duration
                    )}\`.`
                ),
            });
        }

        await logChannel.send({ embeds: [timeoutEmbed] });

        if (
            duration >= 6 * 3600 &&
            interaction.guildId === Constants.mainServer
        ) {
            await LoungeLockManager.lock(
                member.id,
                "Timeouted for 6 hours or longer",
                30 * 24 * 3600
            );
        }

        return this.createOperationResult(true);
    }

    /**
     * Removes a timeout.
     *
     * @param member The guild member to untimeout.
     * @param interaction The interaction that triggered the untimeout, if any.
     * @param reason The reason for untimeouting.
     * @param language The locale of the user who attempted to remove the guild member's timeout. Defaults to English.
     * @returns An object containing information about the operation.
     */
    static async removeTimeout(
        member: GuildMember,
        interaction: RepliableInteraction,
        reason: string,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: TimeoutManagerLocalization =
            this.getLocalization(language);

        if (!this.isUserTimeouted(member)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("userNotTimeouted")
            );
        }

        if (reason.length > 1500) {
            return this.createOperationResult(
                false,
                localization.getTranslation("untimeoutReasonTooLong")
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await this.punishmentDb.getGuildConfig(member.guild);

        const punishmentManagerLocalization: PunishmentManagerLocalization =
            this.getPunishmentManagerLocalization(language);

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                punishmentManagerLocalization.getTranslation(
                    this.logChannelNotFoundReject
                )
            );
        }

        const logChannel: GuildBasedChannel | null =
            await guildConfig.getGuildLogChannel(member.guild);

        if (!logChannel?.isTextBased()) {
            return this.createOperationResult(
                false,
                punishmentManagerLocalization.getTranslation(
                    this.logChannelNotValidReject
                )
            );
        }

        const logLocalization: TimeoutManagerLocalization =
            new TimeoutManagerLocalization("en");

        const untimeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()!,
            })
            .setTitle(logLocalization.getTranslation("untimeoutExecuted"))
            .setFooter({
                text: `${logLocalization.getTranslation("userId")}: ${
                    member.id
                } | ${logLocalization.getTranslation("channelId")}: ${
                    interaction.channel?.id
                }`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `**${member} ${StringHelper.formatString(
                    logLocalization.getTranslation("inChannel"),
                    interaction.channel!.toString()
                )}**\n\n` +
                    `=========================\n\n` +
                    `**${logLocalization.getTranslation("reason")}**:\n` +
                    reason
            );

        const userLocalization: TimeoutManagerLocalization =
            this.getLocalization(
                await CommandHelper.getUserPreferredLocale(member.id)
            );

        const userUntimeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()!,
            })
            .setTitle(userLocalization.getTranslation("untimeoutExecuted"))
            .setFooter({
                text: `${userLocalization.getTranslation("userId")}: ${
                    member.id
                } | ${userLocalization.getTranslation("channelId")}: ${
                    interaction.channel?.id
                }`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `**${member} ${StringHelper.formatString(
                    userLocalization.getTranslation("inChannel"),
                    interaction.channel!.toString()
                )}**\n\n` +
                    `=========================\n\n` +
                    `**${userLocalization.getTranslation("reason")}**:\n` +
                    reason
            );

        await logChannel.send({ embeds: [untimeoutEmbed] });

        await this.notifyMember(
            member,
            StringHelper.formatString(
                userLocalization.getTranslation("untimeoutUserNotification"),
                reason
            ),
            userUntimeoutEmbed
        );

        await member.timeout(null, reason);

        return this.createOperationResult(true);
    }

    /**
     * Checks if a guild member is timeouted.
     *
     * @param member The member.
     * @returns Whether the guild member is timeouted.
     */
    static isUserTimeouted(member: GuildMember): boolean {
        return (
            member.communicationDisabledUntilTimestamp !== null &&
            member.communicationDisabledUntilTimestamp > Date.now()
        );
    }

    /**
     * Notifies a guild member about their timeout status.
     *
     * @param member The member to notify.
     * @param content The content of the notification.
     * @param embed The embed for notification.
     */
    private static async notifyMember(
        member: GuildMember,
        content: string,
        embed: EmbedBuilder
    ): Promise<void> {
        await member.send({
            content: MessageCreator.createWarn(content),
            embeds: [embed],
        });
    }

    /**
     * Gets the localization of this manager utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): TimeoutManagerLocalization {
        return new TimeoutManagerLocalization(language);
    }
}
