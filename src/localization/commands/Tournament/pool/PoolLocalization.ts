import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PoolENTranslation } from "./translations/PoolENTranslation";
import { PoolESTranslation } from "./translations/PoolESTranslation";
import { PoolIDTranslation } from "./translations/PoolIDTranslation";
import { PoolKRTranslation } from "./translations/PoolKRTranslation";

export interface PoolStrings {
    readonly poolNotFound: string;
    readonly mapNotFound: string;
    readonly length: string;
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
        id: new PoolIDTranslation(),
        es: new PoolESTranslation(),
    };
}
