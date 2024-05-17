import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TicketEditLocalization } from "@alice-localization/interactions/modals/Support Ticket/ticket-edit/TicketEditLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const language = CommandHelper.getLocale(interaction);
    const localization = new TicketEditLocalization(language);

    const ticketThreadChannelId = interaction.customId.split("#")[1];
    const ticket =
        await DatabaseManager.aliceDb.collections.supportTicket.getFromChannel(
            ticketThreadChannelId,
        );

    if (!ticket) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ticketNotFound"),
            ),
        });
    }

    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");
    const result = await ticket.edit(title, description, language);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("editTicketFailed"),
                title,
                description,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("editTicketSuccess"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
