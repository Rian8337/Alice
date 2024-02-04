import { Translation } from "@alice-localization/base/Translation";
import { EditSupportTicketStrings } from "../EditSupportTicketLocalization";

/**
 * The English translation for the `editSupportTicket` button command.
 */
export class EditSupportTicketENTranslation extends Translation<EditSupportTicketStrings> {
    override readonly translations: EditSupportTicketStrings = {
        ticketNotFound:
            "I'm sorry, I could not find the ticket that is associated to this channel!",
        ticketIsNotOpen: "I'm sorry, the ticket is not open!",
        modalTitle: "Edit Ticket",
        modalTitleLabel: "Title",
        modalTitlePlaceholder: "Enter the title of the ticket.",
        modalDescriptionLabel: "Description",
        modalDescriptionPlaceholder: "Enter the description of the ticket.",
    };
}
