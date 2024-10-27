import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingScoreComparisonENTranslation } from "./translations/OnboardingScoreComparisonENTranslation";

export interface OnboardingScoreComparisonStrings {
    readonly embedTitle: string;
    readonly scoreComparisonIntroduction: string;
    readonly scoreComparisonConstraint: string;
    readonly commandInChannelsQuote: string;
    readonly accountRegistrationQuote: string;
    readonly compareCommandExplanation: string;
    readonly accountBindConvenienceQuote: string;
}

/**
 * Localizations for the `onboardingScoreComparison` button command.
 */
export class OnboardingScoreComparisonLocalization extends Localization<OnboardingScoreComparisonStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingScoreComparisonStrings>
    > = {
        en: new OnboardingScoreComparisonENTranslation(),
    };
}
