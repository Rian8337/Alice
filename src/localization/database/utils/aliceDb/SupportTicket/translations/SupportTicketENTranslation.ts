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
        embedTicketAssignees: "Assignees",
        embedTicketOpen: "Open",
        embedTicketClosed: "Closed",
        embedTicketTitle: "Title",
        embedTicketDescription: "Description",
        ticketIsOpen: "ticket is already open",
        ticketIsNotOpen: "ticket is not open",
        userIsAlreadyAssigned: "already assigned to ticket",
        userIsNotAssigned: "not assigned to ticket",
        cannotGetTicketMessage: "could not get ticket embed header",
        userControlPanelEditButtonLabel: "Edit",
        userControlPanelCloseButtonLabel: "Close",
        userControlPanelOpenButtonLabel: "Open",
        userControlPanelTrackingMessageButtonLabel: "Tracker (Staff Only)",
        trackingMessageAssignButtonLabel: "Assign",
        trackingMessageUnassignButtonLabel: "Unassign",
        trackingMessageTicketChannelButtonLabel: "Ticket Channel",
        none: "None",
    };
}
