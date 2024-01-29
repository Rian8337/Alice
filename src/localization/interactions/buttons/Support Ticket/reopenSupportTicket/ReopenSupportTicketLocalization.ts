import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ReopenSupportTicketENTranslation } from "./translations/ReopenSupportTicketENTranslation";

export interface ReopenSupportTicketStrings {
    readonly ticketNotFound: string;
    readonly ticketIsNotClosed: string;
    readonly reopenTicketFailed: string;
    readonly reopenTicketSuccess: string;
}

/**
 * Localizations for the `reopenSupportTicket` button command.
 */
export class ReopenSupportTicketLocalization extends Localization<ReopenSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<ReopenSupportTicketStrings>
    > = {
        en: new ReopenSupportTicketENTranslation(),
    };
}
