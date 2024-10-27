import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AssignSupportTicketENTranslation } from "./translations/AssignSupportTicketENTranslation";

export interface AssignSupportTicketStrings {
    readonly ticketNotFound: string;
    readonly assignTicketFailed: string;
    readonly assignTicketSuccess: string;
}

/**
 * Localizations for the `assignSupportTicket` button command.
 */
export class AssignSupportTicketLocalization extends Localization<AssignSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<AssignSupportTicketStrings>
    > = {
        en: new AssignSupportTicketENTranslation(),
    };
}
