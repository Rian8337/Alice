import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { ProfileCardCreatorENTranslation } from "./translations/ProfileCardCreatorENTranslation";
import { ProfileCardCreatorESTranslation } from "./translations/ProfileCardCreatorESTranslation";
import { ProfileCardCreatorIDTranslation } from "./translations/ProfileCardCreatorIDTranslation";
import { ProfileCardCreatorKRTranslation } from "./translations/ProfileCardCreatorKRTranslation";

export interface ProfileCardCreatorStrings {
    readonly totalScore: string;
    readonly accuracy: string;
    readonly playCount: string;
    readonly performancePoints: string;
    readonly clan: string;
    readonly challengePoints: string;
}

/**
 * Localizations for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorLocalization extends Localization<ProfileCardCreatorStrings> {
    protected override readonly localizations: Readonly<
        Translations<ProfileCardCreatorStrings>
    > = {
        en: new ProfileCardCreatorENTranslation(),
        kr: new ProfileCardCreatorKRTranslation(),
        id: new ProfileCardCreatorIDTranslation(),
        es: new ProfileCardCreatorESTranslation(),
    };
}
