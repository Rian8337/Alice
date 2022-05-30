import { Constants } from "@alice-core/Constants";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.has(
            DPPHelper.ppModeratorRole
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(
                    await CommandHelper.getLocale(interaction)
                ).getTranslation(Constants.noPermissionReject)
            ),
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const config: SlashSubcommand["config"] = {
    permissions: ["SPECIAL"],
};
