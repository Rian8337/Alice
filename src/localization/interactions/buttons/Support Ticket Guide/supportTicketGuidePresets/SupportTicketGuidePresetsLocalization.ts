import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { SupportTicketGuidePresetsENTranslation } from "./translations/SupportTicketGuidePresetsENTranslation";

export interface SupportTicketGuidePresetsStrings {
    readonly embedTitle: string;
    readonly aboutTicketPresets: string;
    readonly howToUse: string;
}

/**
 * Localizations for the `supportTicketGuidePresets` button command.
 */
export class SupportTicketGuidePresetsLocalization extends Localization<SupportTicketGuidePresetsStrings> {
    protected override readonly localizations: Readonly<
        Translations<SupportTicketGuidePresetsStrings>
    > = {
        en: new SupportTicketGuidePresetsENTranslation(),
    };
}
