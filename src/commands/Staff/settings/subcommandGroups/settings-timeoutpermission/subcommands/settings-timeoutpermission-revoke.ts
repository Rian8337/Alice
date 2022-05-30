import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { SettingsLocalization } from "@alice-localization/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Role } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const role: Role = <Role>interaction.options.getRole("role", true);

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId!
        );

    if (!guildConfig) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noLogChannelConfigured")
            ),
        });
    }

    await guildConfig.revokeTimeoutPermission(role.id);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("revokeTimeoutPermissionSuccess"),
            role.name
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
