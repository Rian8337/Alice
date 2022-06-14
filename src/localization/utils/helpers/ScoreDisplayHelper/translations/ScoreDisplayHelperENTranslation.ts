import { Translation } from "@alice-localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

/**
 * The English translation for the `ScoreDisplayHelper` helper utility.
 */
export class ScoreDisplayHelperENTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "Recent plays for %s",
        beatmapHasNoScores:
            "I'm sorry, this beatmap doesn't have any scores submitted!",
        topScore: "Top Score",
    };
}
