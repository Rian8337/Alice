import { CreateSupportTicketLocalization } from "@localization/interactions/buttons/Support Ticket/createSupportTicket/CreateSupportTicketLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { ModalCreator } from "@utils/creators/ModalCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization = new CreateSupportTicketLocalization(
        CommandHelper.getLocale(interaction),
    );

    ModalCreator.createModal(
        interaction,
        "ticket-create",
        localization.getTranslation("modalTitle"),
        new TextInputBuilder()
            .setCustomId("title")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setPlaceholder(
                localization.getTranslation("modalTitlePlaceholder"),
            )
            .setLabel(localization.getTranslation("modalTitleLabel")),
        new TextInputBuilder()
            .setCustomId("description")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500)
            .setPlaceholder(
                localization.getTranslation("modalDescriptionPlaceholder"),
            )
            .setLabel(localization.getTranslation("modalDescriptionLabel")),
    );
};

export const config: ButtonCommand["config"] = {
    cooldown: 300,
    instantDeferInDebug: false,
};
