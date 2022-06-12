import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { CompareScoreENTranslation } from "./translations/CompareScoreENTranslation";
import { CompareScoreESTranslation } from "./translations/CompareScoreESTranslation";
import { CompareScoreIDTranslation } from "./translations/CompareScoreIDTranslation";
import { CompareScoreKRTranslation } from "./translations/CompareScoreKRTranslation";

export interface CompareScoreStrings {
    readonly beatmapNotFound: string;
    readonly profileNotFound: string;
    readonly scoreNotFound: string;
    readonly comparePlayDisplay: string;
}

/**
 * Localizations for the `compareScore` context menu command.
 */
export class CompareScoreLocalization extends Localization<CompareScoreStrings> {
    protected override readonly localizations: Readonly<
        Translations<CompareScoreStrings>
    > = {
        en: new CompareScoreENTranslation(),
        es: new CompareScoreESTranslation(),
        id: new CompareScoreIDTranslation(),
        kr: new CompareScoreKRTranslation(),
    };
}
