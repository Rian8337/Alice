import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import {
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildChannel,
    GuildMember,
    MessageEmbed,
    TextChannel,
} from "discord.js";

export const run: EventUtil["run"] = async (
    client,
    oldMember: GuildMember,
    newMember: GuildMember
) => {
    if (
        !oldMember.communicationDisabledUntil &&
        newMember.communicationDisabledUntil
    ) {
        // Member was timeouted
        const auditLogEntries: GuildAuditLogs<"MEMBER_UPDATE"> =
            await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: "MEMBER_UPDATE",
            });

        const auditLog:
            | GuildAuditLogsEntry<
                  "MEMBER_UPDATE",
                  "MEMBER_UPDATE",
                  "UPDATE",
                  "USER"
              >
            | undefined = auditLogEntries.entries.first();

        if (
            !auditLog ||
            !auditLog.executor ||
            auditLog.executor.id === client.user!.id
        ) {
            return;
        }

        // TODO: check this typings
        if (
            !auditLog.changes ||
            //@ts-expect-error: Wrong typings?
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

        const logChannel: GuildChannel | null =
            await guildConfig.getGuildLogChannel(newMember.guild);

        if (!(logChannel instanceof TextChannel)) {
            return;
        }

        const timeoutDate: Date = new Date(<string>auditLog.changes[0].new);

        const timeDifference: number = Math.ceil(
            DateTimeFormatHelper.getTimeDifference(timeoutDate) / 1000
        );

        const timeoutEmbed: MessageEmbed = new MessageEmbed()
            .setAuthor({
                name: auditLog.executor.tag,
                iconURL: auditLog.executor.avatarURL({ dynamic: true })!,
            })
            .setTitle("Timeout executed")
            .setFooter(`User ID: ${newMember.id}`)
            .setTimestamp(new Date())
            .setDescription(
                `**${newMember} for ${DateTimeFormatHelper.secondsToDHMS(
                    timeDifference
                )}**\n\n` +
                    `=========================\n\n` +
                    `**Reason**:\n` +
                    auditLog.reason ?? "Not specified."
            );

        await logChannel.send({ embeds: [timeoutEmbed] });

        try {
            newMember.send({
                content: MessageCreator.createWarn(
                    `Hey, you were timeouted for \`${DateTimeFormatHelper.secondsToDHMS(
                        timeDifference
                    )}\` for \`${auditLog.reason ?? "Not specified"}\`. Sorry!`
                ),
                embeds: [timeoutEmbed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    } else if (
        oldMember.communicationDisabledUntil &&
        !newMember.communicationDisabledUntil
    ) {
        // Member was untimeouted
        const auditLogEntries: GuildAuditLogs<"MEMBER_UPDATE"> =
            await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: "MEMBER_UPDATE",
            });

        const auditLog:
            | GuildAuditLogsEntry<
                  "MEMBER_UPDATE",
                  "MEMBER_UPDATE",
                  "UPDATE",
                  "USER"
              >
            | undefined = auditLogEntries.entries.first();

        if (
            !auditLog ||
            !auditLog.executor ||
            auditLog.executor.id === client.user!.id
        ) {
            return;
        }

        if (
            !auditLog.changes ||
            //@ts-expect-error: Wrong typings?
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

        const logChannel: GuildChannel | null =
            await guildConfig.getGuildLogChannel(newMember.guild);

        if (!(logChannel instanceof TextChannel)) {
            return;
        }

        const untimeoutEmbed: MessageEmbed = new MessageEmbed()
            .setAuthor({
                name: auditLog.executor.tag,
                iconURL: auditLog.executor.avatarURL({ dynamic: true })!,
            })
            .setTitle("Untimeout executed")
            .setFooter(`User ID: ${newMember.id}`)
            .setTimestamp(new Date())
            .setDescription(
                `**Reason**:\n` + auditLog.reason ?? "Not specified."
            );

        await logChannel.send({ embeds: [untimeoutEmbed] });

        try {
            newMember.send({
                content: MessageCreator.createWarn(
                    `Hey, you were untimeouted for \`${
                        auditLog.reason ?? "Not specified"
                    }\`.`
                ),
                embeds: [untimeoutEmbed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging manually given/taken timeouts.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
    debugEnabled: true,
};
