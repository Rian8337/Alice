import { Constants } from "@alice-core/Constants";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { GuildMember } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.has(
            DPPHelper.ppModeratorRole
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject),
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
