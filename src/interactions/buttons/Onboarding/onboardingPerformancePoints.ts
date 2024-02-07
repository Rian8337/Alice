import { OnboardingPerformancePointsLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingPerformancePoints/OnboardingPerformancePointsLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { createOnboardingNavigationRows } from "@alice-utils/creators/OnboardingNavigationRowCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
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
