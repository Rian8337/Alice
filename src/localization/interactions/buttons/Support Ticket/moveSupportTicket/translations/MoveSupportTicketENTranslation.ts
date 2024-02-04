import { Translation } from "@alice-localization/base/Translation";
import { MoveSupportTicketStrings } from "../MoveSupportTicketLocalization";

/**
 * The English translation for the `moveSupportTicket` button command.
 */
export class MoveSupportTicketENTranslation extends Translation<MoveSupportTicketStrings> {
    override readonly translations: MoveSupportTicketStrings = {
        ticketNotFound: "I'm sorry, I could not find the ticket!",
        ticketIsNotOpen: "I'm sorry, this ticket is not open!",
        selectChannelPrompt: "Please select a channel to move the ticket to.",
        moveTicketFailed: "I'm sorry, I could not move the ticket: %s.",
        moveTicketSuccess: "Successfully moved the ticket to %s.",
    };
}
