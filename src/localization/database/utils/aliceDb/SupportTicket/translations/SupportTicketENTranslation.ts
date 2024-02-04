import { Translation } from "@alice-localization/base/Translation";
import { SupportTicketStrings } from "../SupportTicketLocalization";

/**
 * The English translation for the `SupportTicket` database utility.
 */
export class SupportTicketENTranslation extends Translation<SupportTicketStrings> {
    override readonly translations: SupportTicketStrings = {
        ticketMovedNotice: "This ticket has been moved to %s.",
        embedAuthor: "Author",
        embedCreationDate: "Creation Date",
        embedStatus: "Status",
        embedTicketAssignees: "Assignees",
        embedTicketOpen: "Open",
        embedTicketClosed: "Closed",
        embedTicketDescription: "Description",
        ticketIsOpen: "ticket is already open",
        ticketIsNotOpen: "ticket is not open",
        userIsAlreadyAssigned: "already assigned to ticket",
        userIsNotAssigned: "not assigned to ticket",
        cannotGetTicketMessage: "could not get ticket embed header",
        cannotCreateThread:
            "could not create a thread in the designated channel",
        userControlPanelEditButtonLabel: "Edit",
        userControlPanelCloseButtonLabel: "Close",
        userControlPanelOpenButtonLabel: "Open",
        userControlPanelMoveButtonLabel: "Move (Staff Only)",
        userControlPanelTrackingMessageButtonLabel: "Tracker (Staff Only)",
        trackingMessageAssignButtonLabel: "Assign",
        trackingMessageUnassignButtonLabel: "Unassign",
        trackingMessageTicketChannelButtonLabel: "Ticket Channel",
        trackingMessageMoveButtonLabel: "Move",
        none: "None",
    };
}
