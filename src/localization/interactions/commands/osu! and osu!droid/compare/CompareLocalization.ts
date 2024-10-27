import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { CompareENTranslation } from "./translations/CompareENTranslation";
import { CompareESTranslation } from "./translations/CompareESTranslation";
import { CompareIDTranslation } from "./translations/CompareIDTranslation";
import { CompareKRTranslation } from "./translations/CompareKRTranslation";

export interface CompareStrings {
    readonly tooManyOptions: string;
    readonly noCachedBeatmap: string;
    readonly playerNotFound: string;
    readonly selfScoreNotFound: string;
    readonly userScoreNotFound: string;
    readonly comparePlayDisplay: string;
}

/**
 * Localizations for the `compare` command.
 */
export class CompareLocalization extends Localization<CompareStrings> {
    protected override readonly localizations: Readonly<
        Translations<CompareStrings>
    > = {
        en: new CompareENTranslation(),
        kr: new CompareKRTranslation(),
        id: new CompareIDTranslation(),
        es: new CompareESTranslation(),
    };
}
