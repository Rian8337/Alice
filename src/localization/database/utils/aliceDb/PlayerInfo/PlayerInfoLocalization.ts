import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PlayerInfoENTranslation } from "./translations/PlayerInfoENTranslation";
import { PlayerInfoIDTranslation } from "./translations/PlayerInfoIDTranslation";
import { PlayerInfoKRTranslation } from "./translations/PlayerInfoKRTranslation";

export interface PlayerInfoStrings {
    readonly tooMuchCoinDeduction: string;
    readonly dailyClaimUsed: string;
    readonly dailyLimitReached: string;
}

/**
 * Localizations for the `PlayerInfo` database utility.
 */
export class PlayerInfoLocalization extends Localization<PlayerInfoStrings> {
    protected override readonly localizations: Readonly<
        Translations<PlayerInfoStrings>
    > = {
        en: new PlayerInfoENTranslation(),
        kr: new PlayerInfoKRTranslation(),
        id: new PlayerInfoIDTranslation(),
    };
}
