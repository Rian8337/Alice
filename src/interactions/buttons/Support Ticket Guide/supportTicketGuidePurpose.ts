import { SupportTicketGuidePurposeLocalization } from "@alice-localization/interactions/buttons/Support Ticket Guide/supportTicketGuidePurpose/SupportTicketGuidePurposeLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { createSupportTicketGuideButton } from "@alice-utils/creators/SupportTicketGuideButtonCreator";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language = CommandHelper.getLocale(interaction);
    const localization = new SupportTicketGuidePurposeLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("supportTicketMainPurpose") +
                "\n\n" +
                localization.getTranslation("supportTicketConstraint"),
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
