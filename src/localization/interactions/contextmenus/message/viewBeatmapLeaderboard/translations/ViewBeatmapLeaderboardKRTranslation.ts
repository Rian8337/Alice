import { Translation } from "@localization/base/Translation";
import { ViewBeatmapLeaderboardStrings } from "../ViewBeatmapLeaderboardLocalization";

/**
 * The Korean translation for the `viewBeatmapLeaderboard` context menu command.
 */
export class ViewBeatmapLeaderboardKRTranslation extends Translation<ViewBeatmapLeaderboardStrings> {
    override readonly translations: ViewBeatmapLeaderboardStrings = {
        beatmapNotFound: "죄송해요, 찾으시려는 비트맵을 찾을 수 없었어요!",
    };
}
