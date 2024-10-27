import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { InitialOnboardingENTranslation } from "./translations/InitialOnboardingENTranslation";

export interface InitialOnboardingStrings {
    readonly welcomeToServer: string;
    readonly accidentalDismissPrompt: string;
    readonly botIntroduction: string;
    readonly onboardingPurpose: string;
    readonly beginOnboarding: string;
}

/**
 * Localizations for the `initialOnboarding` button command.
 */
export class InitialOnboardingLocalization extends Localization<InitialOnboardingStrings> {
    protected override readonly localizations: Readonly<
        Translations<InitialOnboardingStrings>
    > = {
        en: new InitialOnboardingENTranslation(),
    };
}
