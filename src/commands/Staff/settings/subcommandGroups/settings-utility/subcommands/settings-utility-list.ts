import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { author: interaction.user, color: interaction.member.displayColor }
    );

    const onPageChange: OnButtonPageChange = async (_, page, contents: { key: string, value: Collection<string, EventUtil> }[]) => {
        const content: { key: string, value: Collection<string, EventUtil> } = contents[page - 1];

        embed.setDescription(`**Event name: \`${content.key}\`**`);

        for (const [utilName, utility] of content.value) {
            embed.addField(
                `- ${utilName}`,
                `${utility.config.description}\n` +
                `**Required Permissions**: ${PermissionHelper.getPermissionString(utility.config.togglePermissions)}\n` +
                `**Toggleable Scope**: ${utility.config.toggleScope.map(v => StringHelper.capitalizeString(v, true)).join(", ")}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [ embed ] },
        [interaction.user.id],
        ArrayHelper.collectionToArray(client.eventUtilities),
        1,
        1,
        180,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: []
};