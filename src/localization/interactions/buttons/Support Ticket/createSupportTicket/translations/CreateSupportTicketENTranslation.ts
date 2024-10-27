import { Translation } from "@localization/base/Translation";
import { CreateSupportTicketStrings } from "../CreateSupportTicketLocalization";

/**
 * The English translation for the `createSupportTicket` button command.
 */
export class CreateSupportTicketENTranslation extends Translation<CreateSupportTicketStrings> {
    override readonly translations: CreateSupportTicketStrings = {
        modalTitle: "Create Ticket",
        modalTitleLabel: "Title",
        modalTitlePlaceholder: "Enter the title of the ticket.",
        modalDescriptionLabel: "Description",
        modalDescriptionPlaceholder: "Enter the description of the ticket.",
    };
}
