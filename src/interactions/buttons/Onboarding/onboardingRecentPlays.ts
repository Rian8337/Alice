import { Symbols } from "@alice-enums/utils/Symbols";
import { OnboardingRecentPlaysLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingRecentPlays/OnboardingRecentPlaysLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    quote,
} from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: OnboardingRecentPlaysLocalization =
        new OnboardingRecentPlaysLocalization(
            await CommandHelper.getLocale(interaction)
        );

    // TODO: singular recent, 5-play recent
    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
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
                quote(
                    localization.getTranslation("accountBindConvenienceQuote")
                ) +
                "\n\n" +
                localization.getTranslation("tryCommandsForBindedAccount")
        );

    const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId("showMostRecentPlay")
            .setEmoji(Symbols.inboxTray)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("showMostRecentPlay")),
        new ButtonBuilder()
            .setCustomId("showRecentPlays")
            .setEmoji(Symbols.memo)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("showRecentPlays"))
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
        components: [row],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
