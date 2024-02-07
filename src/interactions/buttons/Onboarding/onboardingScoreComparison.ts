import { OnboardingScoreComparisonLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingScoreComparison/OnboardingScoreComparisonLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { createOnboardingNavigationRows } from "@alice-utils/creators/OnboardingNavigationRowCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { quote } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
    const localization = new OnboardingScoreComparisonLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
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

    InteractionHelper.update(interaction, {
        embeds: [embed],
        components: createOnboardingNavigationRows(
            interaction.customId,
            language,
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
