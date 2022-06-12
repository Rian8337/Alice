import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { Language } from "@alice-localization/base/Language";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { CommandInteraction } from "discord.js";

export const run: SlashSubcommand["run"] = async (
    _,
    interaction: CommandInteraction<"cached">
) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !interaction.member.roles.cache.has(Challenge.challengeManagerRole)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
            ),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(interaction, language);
};

export const config: SlashSubcommand["config"] = {
    permissions: ["SPECIAL"],
    replyEphemeral: true,
};
