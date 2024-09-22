import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { ReportMessageLocalization } from "@alice-localization/interactions/contextmenus/message/reportMessage/ReportMessageLocalization";
import { MessageContextMenuCommand } from "@alice-structures/core/MessageContextMenuCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    PermissionsBitField,
    TextChannel,
    bold,
    hyperlink,
    roleMention,
} from "discord.js";

export const run: MessageContextMenuCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new ReportMessageLocalization(
        CommandHelper.getLocale(interaction),
    );

    const toReport = await interaction.guild.members
        .fetch(interaction.targetMessage.author)
        .catch(() => null);

    if (
        !toReport ||
        toReport.user.bot ||
        toReport.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotReportable"),
            ),
        });
    }

    if (toReport.id === interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfReportError"),
            ),
        });
    }

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("reportConfirmation"),
            ),
        },
        [interaction.user.id],
        15,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
        timestamp: true,
    });

    embed
        .setThumbnail(toReport.user.avatarURL()!)
        .setDescription(
            `${bold(localization.getTranslation("offender"))}: ${toReport} (${
                toReport.id
            })\n` +
                `${bold(localization.getTranslation("channel"))}: ${
                    interaction.channel
                } (${hyperlink(
                    localization.getTranslation("goToMessage"),
                    interaction.targetMessage.url,
                )})`,
        );

    const reportChannel = <TextChannel>(
        interaction.guild.channels.cache.get(Constants.reportChannel)
    );

    reportChannel.send({
        content: MessageCreator.createWarn(
            `${Config.verifyPerm
                .map((v) => roleMention(v))
                .join(" ")} user report in ${interaction.channel}`,
        ),
        embeds: [embed],
    });

    const replyEmbed = EmbedCreator.createNormalEmbed({
        color: "#527ea3",
        timestamp: true,
    });

    replyEmbed
        .setAuthor({
            name: localization.getTranslation("reportSummary"),
        })
        .setDescription(
            `${bold(localization.getTranslation("offender"))}: ${toReport} (${
                toReport.id
            })\n` +
                `${bold(localization.getTranslation("channel"))}: ${
                    interaction.channel
                } (${hyperlink(
                    localization.getTranslation("goToMessage"),
                    interaction.targetMessage.url,
                )})\n\n` +
                localization.getTranslation("saveEvidence"),
        );

    interaction.user.send({ embeds: [replyEmbed] }).catch(() =>
        InteractionHelper.reply(interaction, {
            content: MessageCreator.createWarn(
                localization.getTranslation("reporterDmLocked"),
                interaction.user.toString(),
            ),
        }),
    );
};

export const config: MessageContextMenuCommand["config"] = {
    name: "Report Message",
    replyEphemeral: true,
};
