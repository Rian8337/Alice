import { Translation } from "@alice-localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

/**
 * The Indonesian translation for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperIDTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "",
    };
}
