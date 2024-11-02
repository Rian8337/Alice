import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingAccountBindENTranslation } from "./translations/OnboardingAccountBindENTranslation";

export interface OnboardingAccountBindStrings {
    readonly profileNotFound: string;
    readonly incorrectEmail: string;
    readonly bindConfirmation: string;
    readonly discordAccountAlreadyBoundError: string;
    readonly bindError: string;
    readonly accountHasBeenBoundError: string;
    readonly bindSuccessful: string;
}

/**
 * Localizations for the `onboardingAccountBind` modal command.
 */
export class OnboardingAccountBindLocalization extends Localization<OnboardingAccountBindStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingAccountBindStrings>
    > = {
        en: new OnboardingAccountBindENTranslation(),
    };
}
