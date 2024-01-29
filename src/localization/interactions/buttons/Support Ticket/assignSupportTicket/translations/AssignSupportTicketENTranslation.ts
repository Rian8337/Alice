import { Translation } from "@alice-localization/base/Translation";
import { AssignSupportTicketStrings } from "../AssignSupportTicketLocalization";

/**
 * The English translation for the `assignSupportTicket` button command.
 */
export class AssignSupportTicketENTranslation extends Translation<AssignSupportTicketStrings> {
    override readonly translations: AssignSupportTicketStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        assignTicketFailed:
            "I'm sorry, I could not assign you to the ticket: %s.",
        assignTicketSuccess: "Successfully assigned you to the ticket.",
    };
}
