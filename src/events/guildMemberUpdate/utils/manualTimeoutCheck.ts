import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { EventUtil } from "structures/core/EventUtil";
import { ManualTimeoutCheckLocalization } from "@alice-localization/events/guildMemberUpdate/manualTimeoutCheck/ManualTimeoutCheckLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import {
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildMember,
    EmbedBuilder,
    AuditLogEvent,
    GuildBasedChannel,
    bold,
} from "discord.js";

export const run: EventUtil["run"] = async (
    client,
    oldMember: GuildMember,
    newMember: GuildMember
) => {
    const localization: ManualTimeoutCheckLocalization =
        new ManualTimeoutCheckLocalization("en");

    const userLocalization: ManualTimeoutCheckLocalization =
        new ManualTimeoutCheckLocalization(
            await CommandHelper.getLocale(newMember.user)
        );

    if (
        !oldMember.communicationDisabledUntil &&
        newMember.communicationDisabledUntil
    ) {
        // Member was timeouted
        const auditLogEntries: GuildAuditLogs<AuditLogEvent.MemberUpdate> =
            await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberUpdate,
            });

        const auditLog:
            | GuildAuditLogsEntry<AuditLogEvent.MemberUpdate, "Update", "User">
            | undefined = auditLogEntries.entries.first();

        if (
            !auditLog ||
            !auditLog.executor ||
            auditLog.executor.id === client.user.id
        ) {
            return;
        }

        if (
            !auditLog.changes ||
            auditLog.changes[0].key !== "communication_disabled_until"
        ) {
            return;
        }

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                newMember.guild
            );

        if (!guildConfig) {
            return;
        }

        const logChannel: GuildBasedChannel | null =
            await guildConfig.getGuildLogChannel(newMember.guild);

        if (!logChannel?.isTextBased()) {
            return;
        }

        const timeoutDate: Date = new Date(<string>auditLog.changes[0].new);

        const timeDifference: number = Math.ceil(
            DateTimeFormatHelper.getTimeDifference(timeoutDate) / 1000
        );

        const timeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: auditLog.executor.tag,
                iconURL: auditLog.executor.avatarURL()!,
            })
            .setTitle(localization.getTranslation("timeoutExecuted"))
            .setFooter({
                text: `${localization.getTranslation("userId")}: ${
                    newMember.id
                }`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `${bold(
                    `${newMember}: ${DateTimeFormatHelper.secondsToDHMS(
                        timeDifference,
                        localization.language
                    )}`
                )}\n\n` +
                    `=========================\n\n` +
                    `${bold(localization.getTranslation("reason"))}:\n` +
                    (auditLog.reason ??
                        localization.getTranslation("notSpecified"))
            );

        const userTimeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: newMember.user.tag,
                iconURL: newMember.user.avatarURL()!,
            })
            .setTitle(userLocalization.getTranslation("timeoutExecuted"))
            .setFooter({
                text: `${userLocalization.getTranslation("userId")}: ${
                    newMember.id
                }`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `${bold(
                    `${newMember}: ${DateTimeFormatHelper.secondsToDHMS(
                        timeDifference,
                        userLocalization.language
                    )}`
                )}\n\n` +
                    `=========================\n\n` +
                    `${bold(userLocalization.getTranslation("reason"))}:\n` +
                    (auditLog.reason ??
                        userLocalization.getTranslation("notSpecified"))
            );

        try {
            newMember.send({
                content: MessageCreator.createWarn(
                    userLocalization.getTranslation("timeoutUserNotification"),
                    DateTimeFormatHelper.secondsToDHMS(
                        timeDifference,
                        userLocalization.language
                    ),
                    auditLog.reason ??
                        userLocalization.getTranslation("notSpecified")
                ),
                embeds: [userTimeoutEmbed],
            });
            // eslint-disable-next-line no-empty
        } catch {}

        if (
            timeDifference >= 6 * 3600 &&
            newMember.guild.id === Constants.mainServer
        ) {
            await LoungeLockManager.lock(
                newMember.id,
                "Timeouted for 6 hours or longer",
                30 * 24 * 3600
            );
        }

        await logChannel.send({ embeds: [timeoutEmbed] });
    } else if (
        oldMember.communicationDisabledUntil &&
        !newMember.communicationDisabledUntil
    ) {
        // Member was untimeouted
        const auditLogEntries: GuildAuditLogs<AuditLogEvent.MemberUpdate> =
            await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberUpdate,
            });

        const auditLog:
            | GuildAuditLogsEntry<AuditLogEvent.MemberUpdate, "Update", "User">
            | undefined = auditLogEntries.entries.first();

        if (
            !auditLog ||
            !auditLog.executor ||
            auditLog.executor.id === client.user.id
        ) {
            return;
        }

        if (
            !auditLog.changes ||
            auditLog.changes[0].key !== "communication_disabled_until"
        ) {
            return;
        }

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                newMember.guild
            );

        if (!guildConfig) {
            return;
        }

        const logChannel: GuildBasedChannel | null =
            await guildConfig.getGuildLogChannel(newMember.guild);

        if (!logChannel?.isTextBased()) {
            return;
        }

        const untimeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: auditLog.executor.tag,
                iconURL: auditLog.executor.avatarURL()!,
            })
            .setTitle(localization.getTranslation("untimeoutExecuted"))
            .setFooter({
                text: `${localization.getTranslation("userId")}: ${
                    newMember.id
                }`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `${bold(localization.getTranslation("userId"))}:\n` +
                    (auditLog.target?.id ??
                        localization.getTranslation("notSpecified"))
            );

        const userUntimeoutEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({
                name: auditLog.executor.tag,
                iconURL: auditLog.executor.avatarURL()!,
            })
            .setTitle(userLocalization.getTranslation("untimeoutExecuted"))
            .setFooter({
                text: `${userLocalization.getTranslation("userId")}: ${
                    newMember.id
                }`,
            })
            .setTimestamp(new Date())
            .setDescription(
                `${bold(userLocalization.getTranslation("userId"))}:\n` +
                    (auditLog.reason ??
                        userLocalization.getTranslation("notSpecified"))
            );

        try {
            newMember.send({
                content: MessageCreator.createWarn(
                    userLocalization.getTranslation(
                        "untimeoutUserNotification"
                    ),
                    auditLog.reason ??
                        localization.getTranslation("notSpecified")
                ),
                embeds: [userUntimeoutEmbed],
            });
            // eslint-disable-next-line no-empty
        } catch {}

        await logChannel.send({ embeds: [untimeoutEmbed] });
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging manually given/taken timeouts.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
