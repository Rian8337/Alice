import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { OnboardingShowMostRecentPlayENTranslation } from "./translations/OnboardingShowMostRecentPlayENTranslation";
import { OnboardingShowMostRecentPlayESTranslation } from "./translations/OnboardingShowMostRecentPlayESTranslation";
import { OnboardingShowMostRecentPlayIDTranslation } from "./translations/OnboardingShowMostRecentPlayIDTranslation";
import { OnboardingShowMostRecentPlayKRTranslation } from "./translations/OnboardingShowMostRecentPlayKRTranslation";

export interface OnboardingShowMostRecentPlayStrings {
    readonly userNotBinded: string;
    readonly profileNotFound: string;
    readonly playerHasNoRecentPlays: string;
    readonly recentPlayDisplay: string;
}

/**
 * Localizations for the `onboardingShowMostRecentPlay` button command.
 */
export class OnboardingShowMostRecentPlayLocalization extends Localization<OnboardingShowMostRecentPlayStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingShowMostRecentPlayStrings>
    > = {
        en: new OnboardingShowMostRecentPlayENTranslation(),
        es: new OnboardingShowMostRecentPlayESTranslation(),
        id: new OnboardingShowMostRecentPlayIDTranslation(),
        kr: new OnboardingShowMostRecentPlayKRTranslation(),
    };
}
