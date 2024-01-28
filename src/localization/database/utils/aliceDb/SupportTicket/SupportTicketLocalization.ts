import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketENTranslation } from "./translations/SupportTicketENTranslation";

export interface SupportTicketStrings {
    readonly embedAuthor: string;
    readonly embedCreationDate: string;
    readonly embedStatus: string;
    readonly embedTicketOpen: string;
    readonly embedTicketClosed: string;
    readonly embedTicketTitle: string;
    readonly embedTicketDescription: string;
    readonly ticketIsClosed: string;
    readonly ticketIsOpen: string;
}

/**
 * Localizations for the `SupportTicket` database utility.
 */
export class SupportTicketLocalization extends Localization<SupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketStrings>
    > = {
        en: new SupportTicketENTranslation(),
    };
}
