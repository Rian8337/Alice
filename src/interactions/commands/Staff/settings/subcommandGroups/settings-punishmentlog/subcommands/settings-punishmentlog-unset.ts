import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.unsetGuildLogChannel(
        interaction.guildId!
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new SettingsLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("unsetLogChannelSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["MANAGE_GUILD"],
};
