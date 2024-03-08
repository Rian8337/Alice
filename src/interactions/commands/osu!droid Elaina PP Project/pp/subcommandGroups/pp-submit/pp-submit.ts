import { Config } from "@alice-core/Config";
import { SlashSubcommandGroup } from "structures/core/SlashSubcommandGroup";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommandGroup["run"] = async (_, interaction) => {
    if (!Config.isDebug) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                "This command is currently disabled while recalculation is progressing. Please wait patiently. Any submitted scores will still submit to the dpp system via the automatic submission system.",
            ),
        });
    }

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !Config.ppChannel.includes(interaction.channelId)
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new PPLocalization(
                    await CommandHelper.getLocale(interaction),
                ).getTranslation("commandNotAllowed"),
            ),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(
        interaction,
        await CommandHelper.getLocale(interaction),
    );
};

export const config: SlashSubcommandGroup["config"] = {
    permissions: [],
    cooldown: 5,
};
