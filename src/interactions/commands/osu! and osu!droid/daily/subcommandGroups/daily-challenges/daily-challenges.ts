import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { SlashSubcommandGroup } from "structures/core/SlashSubcommandGroup";
import { Language } from "@alice-localization/base/Language";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommandGroup["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

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

export const config: SlashSubcommandGroup["config"] = {
    permissions: ["Special"],
    replyEphemeral: true,
};
