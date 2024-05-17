import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildChannel } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: SettingsLocalization = new SettingsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const channel: GuildChannel = <GuildChannel>(
        interaction.options.getChannel("channel", true)
    );

    if (!channel.isTextBased()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("chosenChannelIsNotText"),
            ),
        });
    }

    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.setGuildLogChannel(
        interaction.guildId!,
        channel.id,
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setLogChannelSuccess"),
            channel.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["ManageGuild"],
};
