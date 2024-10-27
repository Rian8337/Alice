import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { EditSupportTicketENTranslation } from "./translations/EditSupportTicketENTranslation";

export interface EditSupportTicketStrings {
    readonly ticketNotFound: string;
    readonly ticketIsNotOpen: string;
    readonly modalTitle: string;
    readonly modalTitleLabel: string;
    readonly modalTitlePlaceholder: string;
    readonly modalDescriptionLabel: string;
    readonly modalDescriptionPlaceholder: string;
}

/**
 * Localizations for the `editSupportTicket` button command.
 */
export class EditSupportTicketLocalization extends Localization<EditSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<EditSupportTicketStrings>
    > = {
        en: new EditSupportTicketENTranslation(),
    };
}
