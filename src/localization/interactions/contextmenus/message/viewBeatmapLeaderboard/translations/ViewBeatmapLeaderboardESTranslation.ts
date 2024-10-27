import { Translation } from "@localization/base/Translation";
import { ViewBeatmapLeaderboardStrings } from "../ViewBeatmapLeaderboardLocalization";

/**
 * The Spanish translation for the `viewBeatmapLeaderboard` context menu command.
 */
export class ViewBeatmapLeaderboardESTranslation extends Translation<ViewBeatmapLeaderboardStrings> {
    override readonly translations: ViewBeatmapLeaderboardStrings = {
        beatmapNotFound:
            "Lo siento, no puedo encontrar el mapa que estas buscando!",
    };
}
