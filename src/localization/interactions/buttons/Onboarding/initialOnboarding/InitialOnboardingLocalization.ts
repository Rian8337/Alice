import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { InitialOnboardingENTranslation } from "./translations/InitialOnboardingENTranslation";

export interface InitialOnboardingStrings {
    readonly onboardingFeatureNotForUser: string;
    readonly welcomeToServer: string;
    readonly accidentalDismissPrompt: string;
    readonly botIntroduction: string;
    readonly onboardingPurpose: string;
    readonly beginOnboarding: string;
    readonly bindAccount: string;
    readonly playerProfile: string;
    readonly recentPlays: string;
    readonly scoreComparison: string;
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
