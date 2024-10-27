import { Translation } from "@localization/base/Translation";
import { ScoreDisplayHelperStrings } from "../ScoreDisplayHelperLocalization";

export class ScoreDisplayHelperESTranslation extends Translation<ScoreDisplayHelperStrings> {
    override readonly translations: ScoreDisplayHelperStrings = {
        recentPlays: "Jugadas recientes de %s",
        beatmapHasNoScores: "Lo siento, este mapa no tiene ningún puntaje!",
        topScore: "Puntaje más alto",
    };
}
