import { Config } from "@core/Config";
import { SlashSubcommandGroup } from "structures/core/SlashSubcommandGroup";
import { PPLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommandGroup["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !Config.ppChannel.includes(interaction.channelId)
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new PPLocalization(
                    CommandHelper.getLocale(interaction),
                ).getTranslation("commandNotAllowed"),
            ),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        CommandHelper.getLocale(interaction),
    );
};

export const config: SlashSubcommandGroup["config"] = {
    permissions: [],
    cooldown: 5,
};
