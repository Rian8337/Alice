import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingBindAccountENTranslation } from "./translations/OnboardingBindAccountENTranslation";

export interface OnboardingBindAccountStrings {
    readonly bindAccountEmbedTitle: string;
    readonly bindingDefinition: string;
    readonly bindingConstraints: string;
    readonly bindingRequirement: string;
    readonly accountRegistrationQuote: string;
    readonly bindingProcedure: string;
    readonly furtherBindQuote: string;
}

/**
 * Localizations for the `onboardingBindAccount` button command.
 */
export class OnboardingBindAccountLocalization extends Localization<OnboardingBindAccountStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingBindAccountStrings>
    > = {
        en: new OnboardingBindAccountENTranslation(),
    };
}
