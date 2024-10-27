import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingPlayerProfileENTranslation } from "./translations/OnboardingPlayerProfileENTranslation";

export interface OnboardingPlayerProfileStrings {
    readonly embedTitle: string;
    readonly playerProfileIntroduction: string;
    readonly playerProfileConstraint: string;
    readonly accountRegistrationQuote: string;
    readonly profileCommandExplanation: string;
    readonly commandInBotGroundQuote: string;
    readonly accountBindConvenienceQuote: string;
    readonly tryCommandForBindedAccount: string;
    readonly showOwnProfile: string;
}

/**
 * Localizations for the `onboardingPlayerProfile` button command.
 */
export class OnboardingPlayerProfileLocalization extends Localization<OnboardingPlayerProfileStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingPlayerProfileStrings>
    > = {
        en: new OnboardingPlayerProfileENTranslation(),
    };
}
