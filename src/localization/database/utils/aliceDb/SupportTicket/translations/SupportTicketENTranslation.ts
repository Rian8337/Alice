import { Translation } from "@alice-localization/base/Translation";
import { SupportTicketStrings } from "../SupportTicketLocalization";

/**
 * The English translation for the `SupportTicket` database utility.
 */
export class SupportTicketENTranslation extends Translation<SupportTicketStrings> {
    override readonly translations: SupportTicketStrings = {
        embedAuthor: "Author",
        embedCreationDate: "Creation Date",
        embedStatus: "Status",
        embedTicketOpen: "Open",
        embedTicketClosed: "Closed",
        embedTicketTitle: "Title",
        embedTicketDescription: "Description",
        ticketIsClosed: "ticket is already closed",
        ticketIsOpen: "ticket is already open",
    };
}
