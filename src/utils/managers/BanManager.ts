import {
    CommandInteraction,
    GuildChannel,
    GuildMember,
    MessageEmbed,
    TextChannel,
    User,
} from "discord.js";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { PunishmentManager } from "./PunishmentManager";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";

/**
 * A manager for bans.
 */
export abstract class BanManager extends PunishmentManager {
    /**
     * Bans a user.
     *
     * @param interaction The message that triggered the ban.
     * @param banned The guild member who was banned.
     * @param reason The reason for banning.
     * @returns An object containing information about the operation.
     */
    static async ban(
        interaction: CommandInteraction,
        banned: GuildMember,
        reason: string
    ): Promise<OperationResult> {
        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                banned.guild
            );

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(
            banned.guild
        );

        if (!logChannel) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(
                false,
                this.logChannelNotValidReject
            );
        }

        await banned.ban({
            reason:
                reason +
                ` (banned by ${interaction.user.tag} (${interaction.user.id}))`,
        });

        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember>interaction.member).displayColor,
            timestamp: true,
        });

        embed
            .setThumbnail(banned.user.avatarURL({ dynamic: true })!)
            .setTitle("Ban executed")
            .addField(
                `Banned user: ${banned.user.username}`,
                `User ID: ${banned.id}`
            )
            .addField("=========================", `Reason:\n${reason}`);

        logChannel.send({ embeds: [embed] });

        return this.createOperationResult(true);
    }

    /**
     * Unbans a user.
     *
     * @param interaction The interaction that triggered the unban.
     * @param toUnban The user to unban.
     * @param reason The reason for unbanning.
     * @returns An object containing information about the operation.
     */
    static async unban(
        interaction: CommandInteraction,
        toUnban: User,
        reason: string
    ): Promise<OperationResult> {
        if (!interaction.inGuild()) {
            return this.createOperationResult(
                false,
                "can only unban in a server"
            );
        }

        const guildConfig: GuildPunishmentConfig | null =
            await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
                interaction.guildId!
            );

        if (!guildConfig) {
            return this.createOperationResult(
                false,
                this.logChannelNotFoundReject
            );
        }

        const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(
            interaction.guild!
        );

        if (!(logChannel instanceof TextChannel)) {
            return this.createOperationResult(
                false,
                this.logChannelNotValidReject
            );
        }

        await interaction.guild!.members.unban(
            toUnban,
            reason +
                ` (unbanned by ${interaction.user.tag} (${interaction.user.id}))`
        );

        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember>interaction.member).displayColor,
            timestamp: true,
        });

        embed
            .setThumbnail(toUnban.avatarURL({ dynamic: true })!)
            .setTitle("Unban executed")
            .addField(
                `Unbanned user: ${toUnban.username}`,
                `User ID: ${toUnban.id}`
            )
            .addField("=========================", `Reason:\n${reason}`);

        logChannel.send({ embeds: [embed] });

        return this.createOperationResult(true);
    }
}
