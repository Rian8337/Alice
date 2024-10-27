import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { SupportTicketGuideDosDontsENTranslation } from "./translations/SupportTicketGuideDosDontsENTranslation";

export interface SupportTicketGuideDosDontsStrings {
    readonly embedTitle: string;
    readonly createTicketDosHeader: string;
    readonly createTicketDos1: string;
    readonly createTicketDos2: string;
    readonly createTicketDontsHeader: string;
    readonly createTicketDonts1: string;
    readonly createTicketDonts2: string;
}

/**
 * Localizations for the `supportTicketGuideDosDonts` button command.
 */
export class SupportTicketGuideDosDontsLocalization extends Localization<SupportTicketGuideDosDontsStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketGuideDosDontsStrings>
    > = {
        en: new SupportTicketGuideDosDontsENTranslation(),
    };
}
