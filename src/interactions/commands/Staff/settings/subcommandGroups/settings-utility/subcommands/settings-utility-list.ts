import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { bold, EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: SettingsLocalization = new SettingsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    const onPageChange: OnButtonPageChange = async (_, page) => {
        embed.setDescription(
            bold(
                `${localization.getTranslation(
                    "eventName",
                )}: \`${client.eventUtilities.keyAt(page - 1)}\``,
            ),
        );

        for (const [utilName, utility] of client.eventUtilities.at(page - 1)!) {
            embed.addFields({
                name: `- ${utilName}`,
                value:
                    `${utility.config.description}\n` +
                    `${bold(
                        localization.getTranslation("requiredPermissions"),
                    )}: ${PermissionHelper.getPermissionString(
                        utility.config.togglePermissions,
                    )}\n` +
                    `${bold(
                        localization.getTranslation("toggleableScope"),
                    )}: ${utility.config.toggleScope
                        .map((v) => StringHelper.capitalizeString(v, true))
                        .join(", ")}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        client.eventUtilities.size,
        180,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
