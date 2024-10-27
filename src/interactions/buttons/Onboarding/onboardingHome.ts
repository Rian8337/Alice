import { Config } from "@core/Config";
import { OnboardingHomeLocalization } from "@localization/interactions/buttons/Onboarding/onboardingHome/OnboardingHomeLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { createOnboardingNavigationRows } from "@utils/creators/OnboardingNavigationRowCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { bold, userMention } from "discord.js";

export const run: ButtonCommand["run"] = async (client, interaction) => {
    const language = CommandHelper.getLocale(interaction);
    const localization = new OnboardingHomeLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
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
                    userMention(Config.botOwners[1]),
                ) +
                "\n\n" +
                localization.getTranslation("onboardingPurpose") +
                "\n\n" +
                localization.getTranslation("beginOnboarding"),
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
