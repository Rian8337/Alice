import { Translation } from "@localization/base/Translation";
import { CompareScoreStrings } from "../CompareScoreLocalization";

/**
 * The Spanish translation for the `compareScore` context menu command.
 */
export class CompareScoreESTranslation extends Translation<CompareScoreStrings> {
    override readonly translations: CompareScoreStrings = {
        beatmapNotFound:
            "Lo siento, no puedo encontrar el mapa que estas buscando!",
        profileNotFound: "Lo siento, no puedo encontrar tu perfil!",
        scoreNotFound: "Lo siento, no tienes ninguna puntuación en este mapa!",
        comparePlayDisplay: "Comparación de %s: ",
    };
}
