import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingBindAccountActionENTranslation } from "./translations/OnboardingBindAccountActionENTranslation";

export interface OnboardingBindAccountActionStrings {
    readonly bindModalTitle: string;
    readonly bindModalEmailLabel: string;
    readonly bindModalEmailPlaceholder: string;
    readonly bindModalUsernameLabel: string;
    readonly bindModalUsernamePlaceholder: string;
}

/**
 * Localizations for the `onboardingBindAccountAction` button command.
 */
export class OnboardingBindAccountActionLocalization extends Localization<OnboardingBindAccountActionStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingBindAccountActionStrings>
    > = {
        en: new OnboardingBindAccountActionENTranslation(),
    };
}
