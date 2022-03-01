import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { SettingsLocalization } from "@alice-localization/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.unsetGuildLogChannel(
        interaction.guildId!
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            new SettingsLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("unsetLogChannelSuccess")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["MANAGE_GUILD"],
};
