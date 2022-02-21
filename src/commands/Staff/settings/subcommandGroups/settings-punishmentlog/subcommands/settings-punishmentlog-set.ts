import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { SettingsLocalization } from "@alice-localization/commands/Staff/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildChannel } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const channel: GuildChannel = <GuildChannel>(
        interaction.options.getChannel("channel", true)
    );

    if (!channel.isText()) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("chosenChannelIsNotText")
            ),
        });
    }

    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.setGuildLogChannel(
        interaction.guildId!,
        channel.id
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("setLogChannelSuccess"),
            channel.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["MANAGE_GUILD"],
};
