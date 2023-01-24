import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { OnboardingRecentPlaysENTranslation } from "./translations/OnboardingRecentPlaysENTranslation";

export interface OnboardingRecentPlaysStrings {
    readonly embedTitle: string;
    readonly recentPlaysIntroduction: string;
    readonly accountRegistrationQuote: string;
    readonly recentCommandExplanation: string;
    readonly recent5CommandExplanation: string;
    readonly accountBindConvenienceQuote: string;
    readonly tryCommandsForBindedAccount: string;
    readonly showMostRecentPlay: string;
    readonly showRecentPlays: string;
}

/**
 * Localizations for the `onboardingRecentPlays` button command.
 */
export class OnboardingRecentPlaysLocalization extends Localization<OnboardingRecentPlaysStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingRecentPlaysStrings>
    > = {
        en: new OnboardingRecentPlaysENTranslation(),
    };
}
