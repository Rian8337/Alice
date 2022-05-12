import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MultiplayerRoomENTranslation } from "./translations/MultiplayerRoomENTranslation";
import { MultiplayerRoomESTranslation } from "./translations/MultiplayerRoomESTranslation";
import { MultiplayerRoomIDTranslation } from "./translations/MultiplayerRoomIDTranslation";
import { MultiplayerRoomKRTranslation } from "./translations/MultiplayerRoomKRTranslation";

export interface MultiplayerRoomStrings {
    readonly scoreV1: string;
    readonly accuracy: string;
    readonly maxCombo: string;
    readonly scoreV2: string;
    readonly most300s: string;
    readonly least100s: string;
    readonly least50s: string;
    readonly leastMisses: string;
    readonly leastUnstableRate: string;
    readonly mostDroidPp: string;
    readonly mostPcPp: string;
    readonly headToHead: string;
    readonly teamVS: string;
}

/**
 * Localizations for the `MultiplayerRoom` database utility.
 */
export class MultiplayerRoomLocalization extends Localization<MultiplayerRoomStrings> {
    protected override readonly localizations: Readonly<
        Translations<MultiplayerRoomStrings>
    > = {
        en: new MultiplayerRoomENTranslation(),
        kr: new MultiplayerRoomKRTranslation(),
        id: new MultiplayerRoomIDTranslation(),
        es: new MultiplayerRoomESTranslation(),
    };
}
