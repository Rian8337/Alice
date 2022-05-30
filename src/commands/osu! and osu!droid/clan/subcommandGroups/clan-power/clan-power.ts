import { Constants } from "@alice-core/Constants";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    if (
        !(<GuildMember>interaction.member).roles.cache.find(
            (r) => r.name === "Referee"
        ) &&
        !staffMembers.has(interaction.user.id)
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
