import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { FancyApplicationStatus } from "@alice-enums/utils/FancyApplicationStatus";
import { Symbols } from "@alice-enums/utils/Symbols";
import { FancyLocalization } from "@alice-localization/interactions/commands/Bot Creators/fancy/FancyLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { TatsuRESTManager } from "@alice-utils/managers/TatsuRESTManager";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
} from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new FancyLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const tatsuXP = await TatsuRESTManager.getUserTatsuXP(
        interaction.guildId,
        interaction.user.id,
    );

    if (tatsuXP === null) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("cannotRetrieveTatsuXP"),
            ),
        });
    }

    if (tatsuXP < 100000) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tatsuXPRequirementNotMet"),
            ),
        });
    }

    const staffChannel = await interaction.guild.channels.fetch(
        Constants.staffChannel,
    );

    if (!staffChannel?.isTextBased()) {
        return;
    }

    const approvalMessage = await staffChannel.send({
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `fancyApplicationInitiateVote#${interaction.user.id}`,
                    )
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(Symbols.checkmark)
                    .setLabel(
                        localization.getTranslation(
                            "applicationMessageInitiateVote",
                        ),
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `fancyApplicationRejectPending#${interaction.user.id}`,
                    )
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(Symbols.cross)
                    .setLabel(
                        localization.getTranslation(
                            "applicationMessageRejectApplication",
                        ),
                    ),
            ),
        ],
        embeds: [
            EmbedCreator.createNormalEmbed({
                author: interaction.user,
                color: (<GuildMember>interaction.member).displayColor,
            })
                .setTitle(
                    localization.getTranslation("applicationMessageEmbedTitle"),
                )
                .setDescription(
                    StringHelper.formatString(
                        localization.getTranslation(
                            "applicationMessageEmbedDescription",
                        ),
                        interaction.user.toString(),
                    ),
                ),
        ],
    });

    const result =
        await DatabaseManager.aliceDb.collections.fancyApplication.insert({
            applicationApprovalMessageId: approvalMessage.id,
            discordId: interaction.user.id,
            createdAt: interaction.createdAt,
            status: FancyApplicationStatus.pendingApproval,
        });

    if (result.failed()) {
        await approvalMessage.delete();

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("applicationFailed"),
                result.reason,
            ),
        });
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("applicationSent"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
