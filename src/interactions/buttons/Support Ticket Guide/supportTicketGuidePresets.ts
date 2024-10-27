import { SupportTicketGuidePresetsLocalization } from "@localization/interactions/buttons/Support Ticket Guide/supportTicketGuidePresets/SupportTicketGuidePresetsLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { createSupportTicketGuideButton } from "@utils/creators/SupportTicketGuideButtonCreator";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language = CommandHelper.getLocale(interaction);
    const localization = new SupportTicketGuidePresetsLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("aboutTicketPresets") +
                "\n\n" +
                localization.getTranslation("howToUse"),
        );

    InteractionHelper.update(interaction, {
        embeds: [embed],
        components: createSupportTicketGuideButton(
            interaction.customId,
            language,
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
    instantDeferInDebug: false,
};
