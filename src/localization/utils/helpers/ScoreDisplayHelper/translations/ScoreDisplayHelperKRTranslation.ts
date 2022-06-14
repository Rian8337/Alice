import { Translation } from "@alice-localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

/**
 * The Korean translation for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperKRTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "%s의 최근 플레이",
        beatmapHasNoScores: "죄송해요, 이 비트맵엔 제출된 기록이 없네요!",
        topScore: "1등 기록",
    };
}
