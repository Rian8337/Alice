import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { WhitelistManagerENTranslation } from "./translations/WhitelistManagerENTranslation";
import { WhitelistManagerESTranslation } from "./translations/WhitelistManagerESTranslation";
import { WhitelistManagerIDTranslation } from "./translations/WhitelistManagerIDTranslation";
import { WhitelistManagerKRTranslation } from "./translations/WhitelistManagerKRTranslation";

export interface WhitelistManagerStrings {
    readonly beatmapIsBlacklisted: string;
    readonly invalidBeatmapDifficulty: string;
    readonly beatmapIsNotBlacklisted: string;
    readonly beatmapIsNotGraveyarded: string;
}

/**
 * Localizations for the `WhitelistManager` manager utility.
 */
export class WhitelistManagerLocalization extends Localization<WhitelistManagerStrings> {
    protected override readonly localizations: Readonly<
        Translations<WhitelistManagerStrings>
    > = {
        en: new WhitelistManagerENTranslation(),
        kr: new WhitelistManagerKRTranslation(),
        id: new WhitelistManagerIDTranslation(),
        es: new WhitelistManagerESTranslation(),
    };
}
