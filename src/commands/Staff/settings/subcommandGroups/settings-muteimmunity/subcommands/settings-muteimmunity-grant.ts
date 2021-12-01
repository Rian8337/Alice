import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Role } from "discord.js";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const role: Role = <Role>interaction.options.getRole("role", true);

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId
        );

    if (!guildConfig || !guildConfig.getGuildLogChannel(interaction.guild)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.noLogChannelConfigured
            ),
        });
    }

    await guildConfig.grantMuteImmunity(role.id);

    interaction.editReply({
        content: MessageCreator.createAccept(
            settingsStrings.grantOrRevokeMuteImmunitySuccess,
            "granted",
            role.name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
