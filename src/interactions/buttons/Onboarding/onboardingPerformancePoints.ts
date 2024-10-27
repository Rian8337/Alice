import { OnboardingPerformancePointsLocalization } from "@localization/interactions/buttons/Onboarding/onboardingPerformancePoints/OnboardingPerformancePointsLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { createOnboardingNavigationRows } from "@utils/creators/OnboardingNavigationRowCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = CommandHelper.getLocale(interaction);
    const localization = new OnboardingPerformancePointsLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "Orange",
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("droidPerformancePointsIntroduction") +
                "\n\n" +
                localization.getTranslation("droidPerformancePointsReadMore"),
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
