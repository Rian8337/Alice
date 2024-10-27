import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { CloseSupportTicketENTranslation } from "./translations/CloseSupportTicketENTranslation";

export interface CloseSupportTicketStrings {
    readonly ticketNotFound: string;
    readonly ticketIsNotOpen: string;
    readonly closeTicketFailed: string;
    readonly closeTicketSuccess: string;
}

/**
 * Localizations for the `closeSupportTicket` button command.
 */
export class CloseSupportTicketLocalization extends Localization<CloseSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<CloseSupportTicketStrings>
    > = {
        en: new CloseSupportTicketENTranslation(),
    };
}
