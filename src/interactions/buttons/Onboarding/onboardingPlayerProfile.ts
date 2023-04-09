import { Symbols } from "@alice-enums/utils/Symbols";
import { OnboardingPlayerProfileLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingPlayerProfile/OnboardingPlayerProfileLocalization";
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
    const localization: OnboardingPlayerProfileLocalization =
        new OnboardingPlayerProfileLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "Gold",
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("playerProfileIntroduction") +
                "\n\n" +
                localization.getTranslation("playerProfileConstraint") +
                "\n\n" +
                quote(localization.getTranslation("accountRegistrationQuote")) +
                "\n\n" +
                localization.getTranslation("profileCommandExplanation") +
                "\n\n" +
                quote(
                    localization.getTranslation("accountBindConvenienceQuote")
                ) +
                "\n\n" +
                localization.getTranslation("tryCommandForBindedAccount")
        );

    const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();
    row.addComponents(
        new ButtonBuilder()
            .setCustomId("onboardingPlayerProfileAction")
            .setEmoji(Symbols.framedPicture)
            .setStyle(ButtonStyle.Primary)
            .setLabel(localization.getTranslation("showOwnProfile"))
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
        components: [row],
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
