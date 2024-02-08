import { SupportTicketGuideDosDontsLocalization } from "@alice-localization/interactions/buttons/Support Ticket Guide/supportTicketGuideDosDonts/SupportTicketGuideDosDontsLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { createSupportTicketGuideButton } from "@alice-utils/creators/SupportTicketGuideButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { unorderedList } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language = await CommandHelper.getLocale(interaction);
    const localization = new SupportTicketGuideDosDontsLocalization(language);

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed
        .setTitle(localization.getTranslation("embedTitle"))
        .setDescription(
            localization.getTranslation("createTicketDosHeader") +
                "\n" +
                unorderedList([
                    localization.getTranslation("createTicketDos1"),
                    localization.getTranslation("createTicketDos2"),
                ]) +
                "\n\n" +
                localization.getTranslation("createTicketDontsHeader") +
                "\n" +
                unorderedList([
                    localization.getTranslation("createTicketDonts1"),
                    localization.getTranslation("createTicketDonts2"),
                ]),
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
