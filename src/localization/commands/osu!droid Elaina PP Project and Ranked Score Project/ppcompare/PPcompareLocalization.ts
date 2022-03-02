import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PPcompareENTranslation } from "./translations/PPcompareENTranslation";
import { PPcompareESTranslation } from "./translations/PPcompareESTranslation";
import { PPcompareIDTranslation } from "./translations/PPcompareIDTranslation";
import { PPcompareKRTranslation } from "./translations/PPcompareKRTranslation";

export interface PPcompareStrings {
    readonly cannotCompareSamePlayers: string;
    readonly playerNotBinded: string;
    readonly uid: string;
    readonly username: string;
    readonly user: string;
    readonly noSimilarPlayFound: string;
    readonly topPlaysComparison: string;
    readonly player: string;
    readonly totalPP: string; // see 39.6
}

/**
 * Localizations for the `ppcompare` command.
 */
export class PPcompareLocalization extends Localization<PPcompareStrings> {
    protected override readonly localizations: Readonly<
        Translations<PPcompareStrings>
    > = {
        en: new PPcompareENTranslation(),
        kr: new PPcompareKRTranslation(),
        id: new PPcompareIDTranslation(),
        es: new PPcompareESTranslation(),
    };
}
