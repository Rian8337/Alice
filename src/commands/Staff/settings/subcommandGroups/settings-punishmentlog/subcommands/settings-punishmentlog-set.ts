import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildChannel } from "discord.js";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const channel: GuildChannel = <GuildChannel>(
        interaction.options.getChannel("channel", true)
    );

    if (!channel.isText()) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.chosenChannelIsNotText
            ),
        });
    }

    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.setGuildLogChannel(
        interaction.guildId!,
        channel.id
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            settingsStrings.setLogChannelSuccess,
            channel.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["MANAGE_GUILD"],
};
