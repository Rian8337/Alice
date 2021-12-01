import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        embed.setDescription(
            `**Event name: \`${client.eventUtilities.keyAt(page - 1)}\`**`
        );

        for (const [utilName, utility] of client.eventUtilities.at(page - 1)!) {
            embed.addField(
                `- ${utilName}`,
                `${utility.config.description}\n` +
                    `**Required Permissions**: ${PermissionHelper.getPermissionString(
                        utility.config.togglePermissions
                    )}\n` +
                    `**Toggleable Scope**: ${utility.config.toggleScope
                        .map((v) => StringHelper.capitalizeString(v, true))
                        .join(", ")}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...client.eventUtilities.values()],
        1,
        1,
        180,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
