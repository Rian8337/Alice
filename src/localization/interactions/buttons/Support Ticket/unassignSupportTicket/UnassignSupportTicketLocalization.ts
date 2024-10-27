import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { UnassignSupportTicketENTranslation } from "./translations/UnassignSupportTicketENTranslation";

export interface UnassignSupportTicketStrings {
    readonly ticketNotFound: string;
    readonly unassignTicketFailed: string;
    readonly unassignTicketSuccess: string;
}

/**
 * Localizations for the `unassignSupportTicket` button command.
 */
export class UnassignSupportTicketLocalization extends Localization<UnassignSupportTicketStrings> {
    protected override readonly localizations: Readonly<
        Translations<UnassignSupportTicketStrings>
    > = {
        en: new UnassignSupportTicketENTranslation(),
    };
}
