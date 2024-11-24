import {
    TextChannel,
    PermissionsBitField,
    roleMention,
    bold,
    InteractionContextType,
} from "discord.js";
import { Config } from "@core/Config";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { Constants } from "@core/Constants";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ReportLocalization } from "@localization/interactions/commands/General/report/ReportLocalization";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    const localization = new ReportLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (
        !interaction.inCachedGuild() ||
        interaction.guildId !== Constants.mainServer
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.notAvailableInServerReject,
                ),
            ),
        });
    }

    const toReport = await interaction.guild.members
        .fetch(interaction.options.getUser("user", true))
        .catch(() => null);

    if (!toReport) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userToReportNotFound"),
            ),
        });
    }

    if (
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

    const reason = interaction.options.getString("reason")!;

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
                }\n` +
                `${bold(localization.getTranslation("reason"))}: ${reason}`,
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
                }\n` +
                `${bold(
                    localization.getTranslation("reason"),
                )}: ${reason}\n\n` +
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

export const category: SlashCommand["category"] = CommandCategory.general;

export const config: SlashCommand["config"] = {
    name: "report",
    description: "Reports a user for breaking rules.",
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.User,
            description: "The user to report.",
        },
        {
            name: "reason",
            required: true,
            type: ApplicationCommandOptionType.String,
            description:
                "The reason for reporting. Maximum length is 1500 characters.",
            maxLength: 1500,
        },
    ],
    example: [
        {
            command: "report",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
                {
                    name: "reason",
                    value: "Posting NSFW",
                },
            ],
            description: 'will report Rian8337 for "Posting NSFW".',
        },
        {
            command: "report",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520",
                },
                {
                    name: "reason",
                    value: "Spamming",
                },
            ],
            description:
                'will report the user with that Discord ID for "Spamming".',
        },
    ],
    contexts: [InteractionContextType.Guild],
    replyEphemeral: true,
};
