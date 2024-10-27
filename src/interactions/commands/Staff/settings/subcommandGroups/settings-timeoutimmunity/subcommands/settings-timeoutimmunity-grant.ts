import { DatabaseManager } from "@database/DatabaseManager";
import { GuildPunishmentConfig } from "@database/utils/aliceDb/GuildPunishmentConfig";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SettingsLocalization } from "@localization/interactions/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { Role } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: SettingsLocalization = new SettingsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const role: Role = interaction.options.getRole("role", true);

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId,
        );

    if (!guildConfig || !guildConfig.getGuildLogChannel(interaction.guild)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noLogChannelConfigured"),
            ),
        });
    }

    await guildConfig.grantTimeoutImmunity(role.id);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("grantTimeoutImmunitySuccess"),
            role.name,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Administrator"],
};
