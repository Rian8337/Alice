import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { PoolENTranslation } from "./translations/PoolENTranslation";
import { PoolESTranslation } from "./translations/PoolESTranslation";
import { PoolKRTranslation } from "./translations/PoolKRTranslation";

export interface PoolStrings {
    readonly poolNotFound: string;
    readonly mapNotFound: string;
    readonly length: string;
    readonly maxScore: string;
    readonly beatmapHasNoScores: string;
    readonly topScore: string;
}

/**
 * Localizations for the `pool` command.
 */
export class PoolLocalization extends Localization<PoolStrings> {
    protected override readonly localizations: Readonly<
        Translations<PoolStrings>
    > = {
        en: new PoolENTranslation(),
        kr: new PoolKRTranslation(),
        es: new PoolESTranslation(),
    };
}
