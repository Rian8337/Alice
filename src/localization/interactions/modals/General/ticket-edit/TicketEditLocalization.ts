import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { TicketEditENTranslation } from "./translations/TicketEditENTranslation";

export interface TicketEditStrings {
    readonly ticketNotFound: string;
    readonly editTicketFailed: string;
    readonly editTicketSuccess: string;
}

/**
 * Localizations for the `ticket-edit` modal command.
 */
export class TicketEditLocalization extends Localization<TicketEditStrings> {
    protected override readonly localizations: Readonly<
        Translations<TicketEditStrings>
    > = {
        en: new TicketEditENTranslation(),
    };
}
