import { Translation } from "@alice-localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

/**
 * The Indonesian translation for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperIDTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "Skor-skor terbaru untuk %s",
        beatmapHasNoScores:
            "Maaf, tidak ada skor yang telah dikirim di beatmap ini!",
        topScore: "Skor Teratas",
    };
}
