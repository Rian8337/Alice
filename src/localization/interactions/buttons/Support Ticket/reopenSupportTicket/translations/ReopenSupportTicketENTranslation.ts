import { Translation } from "@localization/base/Translation";
import { ReopenSupportTicketStrings } from "../ReopenSupportTicketLocalization";

/**
 * The English translation for the `reopenSupportTicket` button command.
 */
export class ReopenSupportTicketENTranslation extends Translation<ReopenSupportTicketStrings> {
    override readonly translations: ReopenSupportTicketStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        ticketIsNotClosed: "I'm sorry, this ticket is not closed!",
        reopenTicketFailed: "I'm sorry, I was unable to reopen the ticket: %s.",
        reopenTicketSuccess: "Successfully reopened the ticket.",
    };
}
