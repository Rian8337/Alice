import {
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildBan,
    EmbedBuilder,
    User,
    AuditLogEvent,
    GuildBasedChannel,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    const auditLogEntries: GuildAuditLogs<AuditLogEvent.MemberBanRemove> =
        await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanRemove,
        });

    const unbanLog:
        | GuildAuditLogsEntry<AuditLogEvent.MemberBanRemove, "Create", "User">
        | undefined = auditLogEntries.entries.first();

    if (!unbanLog) {
        return;
    }

    const user: User = unbanLog.target!;

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

    const logChannel: GuildBasedChannel | null =
        await guildConfig.getGuildLogChannel(guildBan.guild);

    if (!logChannel?.isTextBased()) {
        return;
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        timestamp: true,
    });

    embed
        .setTitle("Unban Executed")
        .setThumbnail(guildBan.user.avatarURL({ extension: "gif" })!)
        .addFields({
            name: `Unbanned user: ${guildBan.user.tag}`,
            value: `User ID: ${guildBan.user.id}`,
        });

    if (unbanLog.executor) {
        embed.setAuthor({
            name: unbanLog.executor.tag,
            iconURL: unbanLog.executor.avatarURL({ extension: "gif" })!,
        });
    }

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for notifying about unban actions.",
    togglePermissions: ["ManageGuild"],
    toggleScope: ["GLOBAL", "GUILD"],
};
