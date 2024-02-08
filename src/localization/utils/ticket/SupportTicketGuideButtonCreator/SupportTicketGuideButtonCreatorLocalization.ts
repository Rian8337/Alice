import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketGuideButtonCreatorENTranslation } from "./translations/SupportTicketGuideButtonCreatorENTranslation";

export interface SupportTicketGuideButtonCreatorStrings {
    readonly homeButton: string;
    readonly purposeButton: string;
    readonly writingTicketButton: string;
    readonly ticketPresetsButton: string;
    readonly dosAndDontsButton: string;
}

/**
 * Localizations for the `SupportTicketGuideButtonCreator` utility.
 */
export class SupportTicketGuideButtonCreatorLocalization extends Localization<SupportTicketGuideButtonCreatorStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketGuideButtonCreatorStrings>
    > = {
        en: new SupportTicketGuideButtonCreatorENTranslation(),
    };
}
