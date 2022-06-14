import { Translation } from "@alice-localization/base/Translation";
import { ViewBeatmapLeaderboardStrings } from "../ViewBeatmapLeaderboardLocalization";

/**
 * The Indonesian translation for the `viewBeatmapLeaderboard` context menu command.
 */
export class ViewBeatmapLeaderboardIDTranslation extends Translation<ViewBeatmapLeaderboardStrings> {
    override readonly translations: ViewBeatmapLeaderboardStrings = {
        beatmapNotFound:
            "Maaf, aku tidak dapat menemukan beatmap yang kamu berikan!",
    };
}
