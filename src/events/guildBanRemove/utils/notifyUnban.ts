import { GuildBan, GuildChannel, MessageEmbed, TextChannel } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    const guildConfig: GuildPunishmentConfig | null = await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(guildBan.guild);

    if (!guildConfig) {
        return;
    }

    const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(guildBan.guild);

    if (!(logChannel instanceof TextChannel)) {
        return;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { timestamp: true }
    );

    embed.setTitle("Unban Executed")
        .setThumbnail(<string> guildBan.user.avatarURL({ dynamic: true }))
        .addField(`Unbanned user: ${guildBan.user.tag}`, `User ID: ${guildBan.user.id}`)
        .addField("=========================", `Reason: ${guildBan.reason ?? "Not specified."}`);

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for notifying about unban actions.",
    togglePermissions: ["MANAGE_GUILD"],
    toggleScope: ["GLOBAL", "GUILD"]
};