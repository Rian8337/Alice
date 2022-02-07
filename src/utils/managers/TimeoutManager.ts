import {
    Collection,
    CommandInteraction,
    GuildChannel,
    GuildMember,
    MessageEmbed,
    Permissions,
    Snowflake,
    TextChannel,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { RoleTimeoutPermission } from "@alice-interfaces/moderation/RoleTimeoutPermission";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PunishmentManager } from "./PunishmentManager";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { LoungeLockManager } from "./LoungeLockManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Constants } from "@alice-core/Constants";

/**
 * A manager for timeouts.
 */
export abstract class TimeoutManager extends PunishmentManager {
    /**
     * Initializes the manager.
     */
    static override async init(): Promise<void> {
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
     * @returns An object containing information about the operation.
     */
    static async addTimeout(
        interaction: CommandInteraction,
        member: GuildMember,
        reason: string,
        duration: number
    ): Promise<OperationResult> {
        if (this.isUserTimeouted(member)) {
            return this.createOperationResult(
                false,
                "user is already timeouted"
            );
        }

        if (await this.userIsImmune(member)) {
            return this.createOperationResult(
                false,
                "user has timeout immunity"
            );
        }

        if (isNaN(duration)) {
            return this.createOperationResult(
                false,
                "invalid timeout duration"
            );
        }

        if (!NumberHelper.isNumberInRange(duration, 30, 28 * 86400, true)) {
            return this.createOperationResult(
                false,
                "timeout duration must be between 30 seconds and 28 days (4 weeks)"
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
                `not enough permission to timeout for ${DateTimeFormatHelper.secondsToDHMS(
                    duration
                )}`
            );
        }

        if (reason.length > 1500) {
            return this.createOperationResult(
                false,
                "timeout reason is too long; maximum is 1500 characters"
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await this.punishmentDb.getGuildConfig(member.guild);

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null =
            await guildConfig.getGuildLogChannel(member.guild);

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(
                false,
                this.logChannelNotValidReject
            );
        }

        await member.disableCommunicationUntil(
            Date.now() + duration * 1000,
            reason
        );

        // TODO: get user locale and translate timeout embed to locale

        const timeoutEmbed: MessageEmbed = new MessageEmbed()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL({ dynamic: true })!,
            })
            .setTitle("Timeout executed")
            .setFooter({
                text: `User ID: ${member.id} | Channel ID: ${interaction.channel?.id}`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `**${member} in ${
                    interaction.channel
                } for ${DateTimeFormatHelper.secondsToDHMS(duration)}**\n\n` +
                    `=========================\n\n` +
                    `**Reason**:\n` +
                    reason
            );

        try {
            await this.notifyMember(
                member,
                `Hey, you were timeouted for \`${DateTimeFormatHelper.secondsToDHMS(
                    duration
                )}\` for \`${reason}\`. Sorry!`,
                timeoutEmbed
            );
        } catch {
            interaction.channel!.send(
                MessageCreator.createWarn(
                    `A user has been timeouted, but their DMs are locked. The user will be timeouted for \`${DateTimeFormatHelper.secondsToDHMS(
                        duration
                    )}\`.`
                )
            );
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
     * @returns An object containing information about the operation.
     */
    static async removeTimeout(
        member: GuildMember,
        interaction: CommandInteraction,
        reason: string
    ): Promise<OperationResult> {
        if (!this.isUserTimeouted(member)) {
            return this.createOperationResult(
                false,
                "the user is not timeouted"
            );
        }

        if (reason.length > 1500) {
            return this.createOperationResult(
                false,
                "timeout reason is too long; maximum is 1500 characters"
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await this.punishmentDb.getGuildConfig(member.guild);

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null =
            await guildConfig.getGuildLogChannel(member.guild);

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(
                false,
                this.logChannelNotValidReject
            );
        }

        const untimeoutEmbed: MessageEmbed = new MessageEmbed()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL({ dynamic: true })!,
            })
            .setTitle("Untimeout executed")
            .setFooter({
                text: `User ID: ${member.id} | Channel ID: ${interaction.channel?.id}`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `**${member} in ${interaction.channel}**\n\n` +
                    `=========================\n\n` +
                    `**Reason**:\n` +
                    reason
            );

        await logChannel.send({ embeds: [untimeoutEmbed] });

        await this.notifyMember(
            member,
            `Hey, you were untimeouted for ${reason}.`,
            untimeoutEmbed
        );

        await member.disableCommunicationUntil(null, reason);

        return this.createOperationResult(true);
    }

    /**
     * Checks if a guild member can timeout a user with specified duration.
     *
     * @param member The guild member executing the timeout.
     * @param duration The duration the guild member wants to timeout for, in seconds.
     * @returns A boolean indicating whether the guild member can timeout the user.
     */
    static async userCanTimeout(
        member: GuildMember,
        duration: number
    ): Promise<boolean> {
        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                member.guild
            );

        if (!guildConfig) {
            return false;
        }

        const allowedTimeoutRoles: Collection<
            Snowflake,
            RoleTimeoutPermission
        > = guildConfig.allowedTimeoutRoles;

        let maxDuration: number = Number.NEGATIVE_INFINITY;

        for (const allowedTimeoutRole of allowedTimeoutRoles.values()) {
            if (!member.roles.cache.has(allowedTimeoutRole.id)) {
                continue;
            }

            if (allowedTimeoutRole.maxTime < 0) {
                return true;
            }

            maxDuration = Math.max(maxDuration, allowedTimeoutRole.maxTime);

            // End loop here if duration is fulfilled
            if (duration <= maxDuration) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if a guild member is immune.
     *
     * @param member The guild member to check.
     * @returns A boolean indicating whether the guild member is immune.
     */
    static async userIsImmune(member: GuildMember): Promise<boolean> {
        if (
            member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
            member.user.bot
        ) {
            return true;
        }

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                member.guild
            );

        if (!guildConfig) {
            return false;
        }

        return member.roles.cache.hasAny(...guildConfig.immuneTimeoutRoles);
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
     * @param client The instance of the bot.
     * @param member The member to notify.
     * @param content The content of the notification.
     * @param embed The embed for notification.
     */
    private static async notifyMember(
        member: GuildMember,
        content: string,
        embed: MessageEmbed
    ): Promise<void> {
        await member.send({
            content: MessageCreator.createWarn(content),
            embeds: [embed],
        });
    }
}
