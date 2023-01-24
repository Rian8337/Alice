import { OnboardingPerformancePointsLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingPerformancePoints/OnboardingPerformancePointsLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { EmbedBuilder } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: OnboardingPerformancePointsLocalization =
        new OnboardingPerformancePointsLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "Orange",
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("droidPerformancePointsIntroduction") +
                "\n\n" +
                localization.getTranslation("droidPerformancePointsReadMore")
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
