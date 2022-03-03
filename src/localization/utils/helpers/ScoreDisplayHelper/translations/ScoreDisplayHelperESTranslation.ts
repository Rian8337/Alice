import { Translation } from "@alice-localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

export class ScoreDisplayHelperESTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "Jugadas recientes de %s",
    };
}
