import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { ViewBeatmapLeaderboardENTranslation } from "./translations/ViewBeatmapLeaderboardENTranslation";
import { ViewBeatmapLeaderboardESTranslation } from "./translations/ViewBeatmapLeaderboardESTranslation";
import { ViewBeatmapLeaderboardIDTranslation } from "./translations/ViewBeatmapLeaderboardIDTranslation";
import { ViewBeatmapLeaderboardKRTranslation } from "./translations/ViewBeatmapLeaderboardKRTranslation";

export interface ViewBeatmapLeaderboardStrings {
    readonly beatmapNotFound: string;
}

/**
 * Localizations for the `viewBeatmapLeaderboard` context menu command.
 */
export class ViewBeatmapLeaderboardLocalization extends Localization<ViewBeatmapLeaderboardStrings> {
    protected override readonly localizations: Readonly<
        Translations<ViewBeatmapLeaderboardStrings>
    > = {
        en: new ViewBeatmapLeaderboardENTranslation(),
        es: new ViewBeatmapLeaderboardESTranslation(),
        id: new ViewBeatmapLeaderboardIDTranslation(),
        kr: new ViewBeatmapLeaderboardKRTranslation(),
    };
}
