import { Symbols } from "@enums/utils/Symbols";
import { OnboardingBindAccountLocalization } from "@localization/interactions/buttons/Onboarding/onboardingBindAccount/OnboardingBindAccountLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { createOnboardingNavigationRows } from "@utils/creators/OnboardingNavigationRowCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    quote,
} from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = CommandHelper.getLocale(interaction);
    const localization = new OnboardingBindAccountLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "Blurple",
    });

    embed
        .setTitle(localization.getTranslation("bindAccountEmbedTitle"))
        .setDescription(
            localization.getTranslation("bindingDefinition") +
                "\n\n" +
                localization.getTranslation("bindingRequirement") +
                "\n\n" +
                quote(localization.getTranslation("accountRegistrationQuote")) +
                "\n\n" +
                localization.getTranslation("bindingConstraints") +
                "\n\n" +
                localization.getTranslation("bindingProcedure") +
                "\n\n" +
                localization.getTranslation("furtherBindQuote"),
        );

    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId("onboardingBindAccountAction")
            .setEmoji(Symbols.lockWithKey)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("bindAccountEmbedTitle")),
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
