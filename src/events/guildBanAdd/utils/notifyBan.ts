import {
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildBan,
    GuildChannel,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    const auditLogEntries: GuildAuditLogs<"MEMBER_BAN_ADD"> =
        await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: "MEMBER_BAN_ADD",
        });

    const banLog:
        | GuildAuditLogsEntry<
              "MEMBER_BAN_ADD",
              "MEMBER_BAN_ADD",
              "DELETE",
              "USER"
          >
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

    if (!(logChannel instanceof TextChannel)) {
        return;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        timestamp: true,
    });

    embed
        .setTitle("Ban Executed")
        .setThumbnail(user.avatarURL({ dynamic: true })!)
        .addField(`Banned user: ${user.tag}`, `User ID: ${user.id}`)
        .addField(
            "=========================",
            `Reason: ${banLog.reason ?? "Not specified."}`
        );

    if (banLog.executor) {
        embed.setAuthor(
            banLog.executor.tag,
            banLog.executor.avatarURL({ dynamic: true })!
        );
    }

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for notifying about ban actions.",
    togglePermissions: ["MANAGE_GUILD"],
    toggleScope: ["GLOBAL", "GUILD"],
};
