import { TicketLocalization } from "@alice-localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new TicketLocalization(
        await CommandHelper.getLocale(interaction),
    );

    // TODO: ticket presets

    ModalCreator.createModal(
        interaction,
        "ticket-create",
        localization.getTranslation("ticketCreateModalTitle"),
        new TextInputBuilder()
            .setCustomId("title")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setLabel(localization.getTranslation("ticketModalTitleLabel")),
        new TextInputBuilder()
            .setCustomId("description")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500)
            .setLabel(
                localization.getTranslation("ticketModalDescriptionLabel"),
            ),
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 30,
};
