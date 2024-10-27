import { Constants } from "@core/Constants";
import { SlashSubcommandGroup } from "structures/core/SlashSubcommandGroup";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DPPHelper } from "@utils/helpers/DPPHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { GuildMember } from "discord.js";

export const run: SlashSubcommandGroup["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.has(
            DPPHelper.ppModeratorRole,
        )
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(
                    CommandHelper.getLocale(interaction),
                ).getTranslation(Constants.noPermissionReject),
            ),
        });
    }

    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const config: SlashSubcommandGroup["config"] = {
    permissions: ["Special"],
};
