import { Translation } from "@alice-localization/base/Translation";
import { TicketStrings } from "../TicketLocalization";

/**
 * The English translation for the `ticket` slash command.
 */
export class TicketENTranslation extends Translation<TicketStrings> {
    override readonly translations: TicketStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        ticketEditModalTitle: "Edit Ticket",
        ticketCreateModalTitle: "Create Ticket",
        ticketModalTitleLabel: "Enter the title of the ticket.",
        ticketModalDescriptionLabel: "Enter the description of the ticket.",
        ticketIsNotOpen: "I'm sorry, the ticket is not open!",
        closeTicketFailed: "I'm sorry, I was unable to close the ticket: %s.",
        closeTicketSuccess: "Successfully closed the ticket.",
        reopenTicketFailed: "I'm sorry, I was unable to reopen the ticket: %s.",
        reopenTicketSuccess: "Successfully reopened the ticket.",
    };
}
