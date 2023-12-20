import { OnboardingScoreComparisonLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingScoreComparison/OnboardingScoreComparisonLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { EmbedBuilder, quote } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: OnboardingScoreComparisonLocalization =
        new OnboardingScoreComparisonLocalization(
            await CommandHelper.getLocale(interaction),
        );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "DarkPurple",
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("scoreComparisonIntroduction") +
                "\n\n" +
                localization.getTranslation("scoreComparisonConstraint") +
                "\n\n" +
                quote(localization.getTranslation("accountRegistrationQuote")) +
                "\n\n" +
                localization.getTranslation("compareCommandExplanation") +
                "\n\n" +
                quote(localization.getTranslation("commandInChannelsQuote")) +
                "\n\n" +
                quote(
                    localization.getTranslation("accountBindConvenienceQuote"),
                ),
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
