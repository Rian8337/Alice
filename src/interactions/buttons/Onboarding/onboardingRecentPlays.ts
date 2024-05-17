import { Symbols } from "@alice-enums/utils/Symbols";
import { OnboardingRecentPlaysLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingRecentPlays/OnboardingRecentPlaysLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { createOnboardingNavigationRows } from "@alice-utils/creators/OnboardingNavigationRowCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    quote,
} from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = CommandHelper.getLocale(interaction);
    const localization = new OnboardingRecentPlaysLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "Navy",
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("recentPlaysIntroduction") +
                "\n\n" +
                quote(localization.getTranslation("accountRegistrationQuote")) +
                "\n\n" +
                localization.getTranslation("recentCommandExplanation") +
                "\n\n" +
                localization.getTranslation("recent5CommandExplanation") +
                "\n\n" +
                quote(localization.getTranslation("commandInBotGroundQuote")) +
                "\n\n" +
                quote(
                    localization.getTranslation("accountBindConvenienceQuote"),
                ) +
                "\n\n" +
                localization.getTranslation("tryCommandsForBindedAccount"),
        );

    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId("onboardingShowMostRecentPlay")
            .setEmoji(Symbols.inboxTray)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("showMostRecentPlay")),
        new ButtonBuilder()
            .setCustomId("onboardingShowRecentPlays")
            .setEmoji(Symbols.memo)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("showRecentPlays")),
    );

    InteractionHelper.update(interaction, {
        embeds: [embed],
        components: [
            ...createOnboardingNavigationRows(interaction.customId, language),
            row,
        ],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
