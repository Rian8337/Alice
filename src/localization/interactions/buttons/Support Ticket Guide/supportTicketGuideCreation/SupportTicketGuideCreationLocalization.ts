import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketGuideCreationENTranslation } from "./translations/SupportTicketGuideCreationENTranslation";

export interface SupportTicketGuideCreationStrings {
    readonly embedTitle: string;
    readonly howToCreateTicket: string;
}

/**
 * Localizations for the `supportTicketGuideCreation` button command.
 */
export class SupportTicketGuideCreationLocalization extends Localization<SupportTicketGuideCreationStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketGuideCreationStrings>
    > = {
        en: new SupportTicketGuideCreationENTranslation(),
    };
}
