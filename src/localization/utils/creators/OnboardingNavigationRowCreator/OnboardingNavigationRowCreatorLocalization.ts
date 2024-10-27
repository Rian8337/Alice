import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingNavigationRowCreatorENTranslation } from "./translations/OnboardingNavigationRowCreatorENTranslation";

export interface OnboardingNavigationRowCreatorStrings {
    readonly home: string;
    readonly bindAccount: string;
    readonly playerProfile: string;
    readonly recentPlays: string;
    readonly scoreComparison: string;
    readonly droidPerformancePoints: string;
}

/**
 * Localizations for the `OnboardingNavigationRowCreator` utility.
 */
export class OnboardingNavigationRowCreatorLocalization extends Localization<OnboardingNavigationRowCreatorStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingNavigationRowCreatorStrings>
    > = {
        en: new OnboardingNavigationRowCreatorENTranslation(),
    };
}
