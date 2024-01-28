import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { TicketLocalization } from "@alice-localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TextInputBuilder, TextInputStyle } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
    const localization = new TicketLocalization(language);

    const id = interaction.options.getInteger("id", true);
    const ticket =
        await DatabaseManager.aliceDb.collections.supportTicket.getFromId(id);

    if (!ticket) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ticketNotFound"),
            ),
        });
    }

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        ticket.author !== interaction.user.id
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    ModalCreator.createModal(
        interaction,
        `ticket-edit#${ticket.id}`,
        localization.getTranslation("ticketEditModalTitle"),
        new TextInputBuilder()
            .setCustomId("title")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setLabel(localization.getTranslation("ticketModalTitleLabel"))
            .setPlaceholder(ticket.title),
        new TextInputBuilder()
            .setCustomId("description")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500)
            .setLabel(
                localization.getTranslation("ticketModalDescriptionLabel"),
            )
            .setPlaceholder(ticket.description),
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
