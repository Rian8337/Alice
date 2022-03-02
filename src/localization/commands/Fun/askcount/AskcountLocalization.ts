import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AskcountENTranslation } from "./translations/AskcountENTranslation";
import { AskcountESTranslation } from "./translations/AskcountESTranslation";
import { AskcountIDTranslation } from "./translations/AskcountIDTranslation";
import { AskcountKRTranslation } from "./translations/AskcountKRTranslation";

export interface AskcountStrings {
    readonly haveNotAsked: string;
    readonly askCount: string;
}

/**
 * Localizations for the `askcount` command.
 */
export class AskcountLocalization extends Localization<AskcountStrings> {
    protected override readonly localizations: Readonly<
        Translations<AskcountStrings>
    > = {
        en: new AskcountENTranslation(),
        kr: new AskcountKRTranslation(),
        id: new AskcountIDTranslation(),
        es: new AskcountESTranslation(),
    };
}
