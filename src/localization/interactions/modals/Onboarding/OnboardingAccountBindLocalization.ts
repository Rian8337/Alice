import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingAccountBindENTranslation } from "./translations/OnboardingAccountBindENTranslation";

export interface OnboardingAccountBindStrings {
    readonly profileNotFound: string;
    readonly incorrectEmail: string;
    readonly newAccountBindConfirmation: string;
    readonly newAccountBindSuccessful: string;
    readonly oldAccountBindSuccessful: string;
    readonly accountBindError: string;
    readonly accountHasBeenBindedError: string;
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
