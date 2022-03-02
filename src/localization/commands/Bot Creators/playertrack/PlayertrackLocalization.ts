import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { PlayertrackENTranslation } from "./translations/PlayertrackENTranslation";
import { PlayertrackESTranslation } from "./translations/PlayertrackESTranslation";
import { PlayertrackIDTranslation } from "./translations/PlayertrackIDTranslation";
import { PlayertrackKRTranslation } from "./translations/PlayertrackKRTranslation";

export interface PlayertrackStrings {
    readonly incorrectUid: string;
    readonly nowTrackingUid: string;
    readonly noLongerTrackingUid: string;
}

/**
 * Localization for the `playertrack` command.
 */
export class PlayertrackLocalization extends Localization<PlayertrackStrings> {
    protected override readonly localizations: Readonly<
        Translations<PlayertrackStrings>
    > = {
        en: new PlayertrackENTranslation(),
        kr: new PlayertrackKRTranslation(),
        id: new PlayertrackIDTranslation(),
        es: new PlayertrackESTranslation(),
    };
}
