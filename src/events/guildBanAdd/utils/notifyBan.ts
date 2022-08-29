import {
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildBan,
    GuildChannel,
    EmbedBuilder,
    User,
    AuditLogEvent,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    const auditLogEntries: GuildAuditLogs<AuditLogEvent.MemberBanAdd> =
        await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd,
        });

    const banLog:
        | GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd, "Delete", "User">
        | undefined = auditLogEntries.entries.first();

    if (!banLog) {
        return;
    }

    const user: User = banLog.target!;

    if (user.id !== guildBan.user.id) {
        return;
    }

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            guildBan.guild
        );

    if (!guildConfig) {
        return;
    }

    const logChannel: GuildChannel | null =
        await guildConfig.getGuildLogChannel(guildBan.guild);

    if (!logChannel?.isTextBased()) {
        return;
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        timestamp: true,
    });

    embed
        .setTitle("Ban Executed")
        .setThumbnail(user.avatarURL({ extension: "gif" })!)
        .addFields(
            {
                name: `Banned user: ${user.tag}`,
                value: `User ID: ${user.id}`,
            },
            {
                name: "=========================",
                value: `Reason: ${banLog.reason ?? "Not specified."}`,
            }
        );

    if (banLog.executor) {
        embed.setAuthor({
            name: banLog.executor.tag,
            iconURL: banLog.executor.avatarURL({ extension: "gif" })!,
        });
    }

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for notifying about ban actions.",
    togglePermissions: ["ManageGuild"],
    toggleScope: ["GLOBAL", "GUILD"],
};
