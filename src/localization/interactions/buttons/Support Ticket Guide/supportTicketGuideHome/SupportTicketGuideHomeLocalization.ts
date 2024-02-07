import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketGuideHomeENTranslation } from "./translations/SupportTicketGuideHomeENTranslation";

export interface SupportTicketGuideHomeStrings {
    readonly embedTitle: string;
    readonly aboutGuide: string;
    readonly beginGuide: string;
    readonly homeButton: string;
}

/**
 * Localizations for the `supportTicketGuideHome` button command.
 */
export class SupportTicketGuideHomeLocalization extends Localization<SupportTicketGuideHomeStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketGuideHomeStrings>
    > = {
        en: new SupportTicketGuideHomeENTranslation(),
    };
}
