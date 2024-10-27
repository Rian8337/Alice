import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { TicketCreateENTranslation } from "./translations/TicketCreateENTranslation";

export interface TicketCreateStrings {
    readonly createTicketFailed: string;
    readonly createTicketSuccess: string;
}

/**
 * Localizations for the `ticket-create` modal command.
 */
export class TicketCreateLocalization extends Localization<TicketCreateStrings> {
    protected override readonly localizations: Readonly<
        Translations<TicketCreateStrings>
    > = {
        en: new TicketCreateENTranslation(),
    };
}
