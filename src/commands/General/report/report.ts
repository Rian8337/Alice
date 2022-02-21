import {
    GuildMember,
    MessageEmbed,
    Permissions,
    TextChannel,
} from "discord.js";
import { Config } from "@alice-core/Config";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ReportLocalization } from "@alice-localization/commands/General/ReportLocalization";

export const run: Command["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ReportLocalization = new ReportLocalization(language);

    if (
        !interaction.inCachedGuild() ||
        interaction.guildId !== Constants.mainServer
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(Constants.notAvailableInServerReject)
            ),
        });
    }

    const toReport: GuildMember | null = await interaction
        .guild!.members.fetch(interaction.options.getUser("user", true))
        .catch(() => null);

    if (!toReport) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userToReportNotFound")
            ),
        });
    }

    if (toReport.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userNotReportable")
            ),
        });
    }

    if (toReport.id === interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("selfReportError")),
        });
    }

    const reason: string = interaction.options.getString("reason")!;

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
        timestamp: true,
    });

    embed
        .setThumbnail(toReport.user.avatarURL({ dynamic: true })!)
        .setDescription(
            `**${localization.getTranslation("offender")}**: ${toReport} (${toReport.id})\n` +
            `**${localization.getTranslation("channel")}**: ${interaction.channel}\n` +
            `**${localization.getTranslation("reason")}**: ${reason}`
        );

    const reportChannel: TextChannel = <TextChannel>(
        interaction.guild!.channels.cache.find(
            (c) => c.name === Config.reportChannel
        )
    );

    reportChannel.send({ embeds: [embed] });

    const replyEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: "#527ea3",
        timestamp: true,
    });

    replyEmbed
        .setAuthor({
            name: localization.getTranslation("reportSummary"),
        })
        .setDescription(
            `**${localization.getTranslation("offender")}**: ${toReport} (${toReport.id})\n` +
            `**${localization.getTranslation("channel")}**: ${interaction.channel}\n` +
            `**${localization.getTranslation("reason")}**: ${reason}\n\n` +
            localization.getTranslation("saveEvidence")
        );

    interaction.user.send({ embeds: [replyEmbed] }).catch(() =>
        interaction.editReply({
            content: MessageCreator.createWarn(
                localization.getTranslation("reporterDmLocked"),
                interaction.user.toString()
            ),
        })
    );
};

export const category: Command["category"] = CommandCategory.GENERAL;

export const config: Command["config"] = {
    name: "report",
    description: "Reports a user for breaking rules.",
    options: [
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to report.",
        },
        {
            name: "reason",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The reason for reporting. Maximum length is 1500 characters.",
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
    permissions: [],
    replyEphemeral: true,
    scope: "GUILD_CHANNEL",
};
