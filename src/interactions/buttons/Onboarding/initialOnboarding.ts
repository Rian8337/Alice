import { Config } from "@alice-core/Config";
import { Symbols } from "@alice-enums/utils/Symbols";
import { InitialOnboardingLocalization } from "@alice-localization/interactions/buttons/Onboarding/initialOnboarding/InitialOnboardingLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import {
    ActionRowBuilder,
    bold,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    userMention,
} from "discord.js";

export const run: ButtonCommand["run"] = async (client, interaction) => {
    const localization: InitialOnboardingLocalization =
        new InitialOnboardingLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "#1cb845",
    });

    embed
        .setTitle(localization.getTranslation("welcomeToServer"))
        .setDescription(
            bold(localization.getTranslation("accidentalDismissPrompt")) +
                "\n\n" +
                StringHelper.formatString(
                    localization.getTranslation("botIntroduction"),
                    client.user.toString(),
                    userMention(Config.botOwners[0]),
                    userMention(Config.botOwners[1])
                ) +
                "\n\n" +
                localization.getTranslation("onboardingPurpose") +
                "\n\n" +
                localization.getTranslation("beginOnboarding")
        );

    const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId("onboardingBindAccount")
            .setEmoji(Symbols.lockWithKey)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("bindAccount")),
        new ButtonBuilder()
            .setCustomId("onboardingPlayerProfile")
            .setEmoji(Symbols.framedPicture)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("playerProfile")),
        new ButtonBuilder()
            .setCustomId("onboardingRecentPlays")
            .setEmoji(Symbols.bookmarkTabs)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(localization.getTranslation("recentPlays")),
        new ButtonBuilder()
            .setCustomId("onboardingScoreComparison")
            .setEmoji(Symbols.barChart)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(localization.getTranslation("scoreComparison")),
        new ButtonBuilder()
            .setCustomId("onboardingPerformancePoints")
            .setEmoji(Symbols.crown)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(localization.getTranslation("droidPerformancePoints"))
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
        components: [row],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
