import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { WarningLocalization } from "@alice-localization/commands/Staff/warning/WarningLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { WarningManager } from "@alice-utils/managers/WarningManager";
import { Collection, GuildMember, MessageEmbed, User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: WarningLocalization = new WarningLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    if (
        user.id !== interaction.user.id &&
        interaction.inCachedGuild() &&
        !(await WarningManager.userCanWarn(interaction.member))
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noPermissionToViewWarning")
            ),
        });
    }

    const warnings: Collection<string, Warning> =
        await DatabaseManager.aliceDb.collections.userWarning.getUserWarningsInGuild(
            interaction.guildId!,
            user.id
        );

    if (warnings.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation(
                    user.id === interaction.user.id
                        ? "selfDontHaveWarnings"
                        : "userDontHaveWarnings"
                )
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(
            StringHelper.formatString(
                localization.getTranslation("warningInfoForUser"),
                user.tag
            )
        )
        .setThumbnail(user.avatarURL({ dynamic: true })!)
        .setDescription(
            `**${localization.getTranslation("totalActivePoints")}**: ${warnings
                .filter((v) => v.isActive)
                .reduce((a, v) => a + v.points, 0)}\n` +
                `**${localization.getTranslation("totalWarnings")}**: ${
                    warnings.size
                }\n` +
                `**${localization.getTranslation(
                    "lastWarning"
                )}**: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(warnings.at(0)!.creationDate * 1000),
                    localization.language
                )}`
        );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(warnings.size, 5 + 5 * (page - 1));
            ++i
        ) {
            const warning: Warning = warnings.at(i)!;

            embed.addField(
                `${i + 1}. ID ${warning.guildSpecificId}`,
                `**${localization.getTranslation("warningIssuer")}**: <@${
                    warning.issuerId
                }> (${warning.issuerId})\n` +
                    `**${localization.getTranslation("channel")}**: <#${
                        warning.channelId
                    }> (${warning.channelId})\n` +
                    `**${localization.getTranslation(
                        "creationDate"
                    )}**: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(warning.creationDate * 1000),
                        localization.language
                    )}\n` +
                    `**${localization.getTranslation(
                        "expirationDate"
                    )}**: ${DateTimeFormatHelper.dateToLocaleString(
                        new Date(warning.expirationDate * 1000),
                        localization.language
                    )}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        {
            embeds: [embed],
        },
        [interaction.user.id],
        1,
        Math.ceil(warnings.size / 5),
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
