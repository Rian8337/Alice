import { Translation } from "@alice-localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

/**
 * The Korean translation for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperKRTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "%s의 최근 플레이",
    };
}
