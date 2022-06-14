import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ScoreDisplayHelperENTranslation } from "./translations/ScoreDisplayHelperENTranslation";
import { ScoreDisplayHelperESTranslation } from "./translations/ScoreDisplayHelperESTranslation";
import { ScoreDisplayHelperIDTranslation } from "./translations/ScoreDisplayHelperIDTranslation";
import { ScoreDisplayHelperKRTranslation } from "./translations/ScoreDisplayHelperKRTranslation";

export interface ScoreDisplayHelperStrings {
    readonly recentPlays: string;
    readonly beatmapHasNoScores: string;
    readonly topScore: string;
}

/**
 * Localizations for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperLocalization extends Localization<ScoreDisplayHelperStrings> {
    protected override readonly localizations: Readonly<
        Translations<ScoreDisplayHelperStrings>
    > = {
        en: new ScoreDisplayHelperENTranslation(),
        kr: new ScoreDisplayHelperKRTranslation(),
        id: new ScoreDisplayHelperIDTranslation(),
        es: new ScoreDisplayHelperESTranslation(),
    };
}
