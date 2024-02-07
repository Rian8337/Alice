import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { InitialSupportTicketGuideENTranslation } from "./translations/InitialSupportTicketGuideENTranslation";

export interface InitialSupportTicketGuideStrings {
    readonly embedTitle: string;
    readonly welcomeToGuide: string;
    readonly beginGuide: string;
    readonly homeButton: string;
}

/**
 * Localizations for the `initialSupportTicketGuide` button command.
 */
export class InitialSupportTicketGuideLocalization extends Localization<InitialSupportTicketGuideStrings> {
    protected override readonly localizations: Readonly<
        Translations<InitialSupportTicketGuideStrings>
    > = {
        en: new InitialSupportTicketGuideENTranslation(),
    };
}
