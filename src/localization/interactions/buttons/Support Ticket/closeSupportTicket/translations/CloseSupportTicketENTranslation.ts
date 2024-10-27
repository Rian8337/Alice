import { Translation } from "@localization/base/Translation";
import { CloseSupportTicketStrings } from "../CloseSupportTicketLocalization";

/**
 * The English translation for the `closeSupportTicket` button command.
 */
export class CloseSupportTicketENTranslation extends Translation<CloseSupportTicketStrings> {
    override readonly translations: CloseSupportTicketStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        ticketIsNotOpen: "I'm sorry, this ticket is not open!",
        closeTicketFailed: "I'm sorry, I was unable to close the ticket: %s.",
        closeTicketSuccess: "Successfully closed the ticket.",
    };
}
