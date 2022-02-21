import { Constants } from "@alice-core/Constants";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const staffMembers: Collection<Snowflake, GuildMember> =
        await PermissionHelper.getMainGuildStaffMembers(client);

    if (
        !(<GuildMember>interaction.member).roles.cache.find(
            (r) => r.name === "Referee"
        ) &&
        !staffMembers.has(interaction.user.id)
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(
                    await CommandHelper.getLocale(interaction)
                ).getTranslation(Constants.noPermissionReject)
            ),
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
