import { Translation } from "@localization/base/Translation";
import { ViewBeatmapLeaderboardStrings } from "../ViewBeatmapLeaderboardLocalization";

/**
 * The English translation for the `viewBeatmapLeaderboard` context menu command.
 */
export class ViewBeatmapLeaderboardENTranslation extends Translation<ViewBeatmapLeaderboardStrings> {
    override readonly translations: ViewBeatmapLeaderboardStrings = {
        beatmapNotFound:
            "I'm sorry, I cannot find the beatmap that you are looking for!",
    };
}
