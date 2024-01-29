import { Translation } from "@alice-localization/base/Translation";
import { UnassignSupportTicketStrings } from "../UnassignSupportTicketLocalization";

/**
 * The English translation for the `unassignSupportTicket` button command.
 */
export class UnassignSupportTicketENTranslation extends Translation<UnassignSupportTicketStrings> {
    override readonly translations: UnassignSupportTicketStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        unassignTicketFailed:
            "I'm sorry, I could not unassign you from the ticket: %s.",
        unassignTicketSuccess: "Successfully unassigned you from the ticket.",
    };
}
