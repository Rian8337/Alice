import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { OnboardingPlayerProfileActionENTranslation } from "./translations/OnboardingPlayerProfileActionENTranslation";
import { OnboardingPlayerProfileActionESTranslation } from "./translations/OnboardingPlayerProfileActionESTranslation";
import { OnboardingPlayerProfileActionIDTranslation } from "./translations/OnboardingPlayerProfileActionIDTranslation";
import { OnboardingPlayerProfileActionKRTranslation } from "./translations/OnboardingPlayerProfileActionKRTranslation";

export interface OnboardingPlayerProfileActionStrings {
    readonly userNotBinded: string;
    readonly profileNotFound: string;
    readonly viewingProfile: string;
}

/**
 * Localizations for the `onboardingPlayerProfileAction` button command.
 */
export class OnboardingPlayerProfileActionLocalization extends Localization<OnboardingPlayerProfileActionStrings> {
    protected override readonly localizations: Readonly<
        Translations<OnboardingPlayerProfileActionStrings>
    > = {
        en: new OnboardingPlayerProfileActionENTranslation(),
        es: new OnboardingPlayerProfileActionESTranslation(),
        id: new OnboardingPlayerProfileActionIDTranslation(),
        kr: new OnboardingPlayerProfileActionKRTranslation(),
    };
}
