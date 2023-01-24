import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { OnboardingPerformancePointsENTranslation } from "./translations/OnboardingPerformancePointsENTranslation";

export interface OnboardingPerformancePointsStrings {
    readonly embedTitle: string;
    readonly droidPerformancePointsIntroduction: string;
    readonly droidPerformancePointsReadMore: string;
}

/**
 * Localizations for the `onboardingPerformancePoints` button command.
 */
export class OnboardingPerformancePointsLocalization extends Localization<OnboardingPerformancePointsStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingPerformancePointsStrings>
    > = {
        en: new OnboardingPerformancePointsENTranslation(),
    };
}
