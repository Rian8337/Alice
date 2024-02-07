import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { OnboardingHomeENTranslation } from "./translations/OnboardingHomeENTranslation";

export interface OnboardingHomeStrings {
    readonly welcomeToServer: string;
    readonly accidentalDismissPrompt: string;
    readonly botIntroduction: string;
    readonly onboardingPurpose: string;
    readonly beginOnboarding: string;
}

/**
 * Localizations for the `onboardingHome` button command.
 */
export class OnboardingHomeLocalization extends Localization<OnboardingHomeStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingHomeStrings>
    > = {
        en: new OnboardingHomeENTranslation(),
    };
}
