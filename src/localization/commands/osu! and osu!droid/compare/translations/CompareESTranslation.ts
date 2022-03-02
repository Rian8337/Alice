import { Translation } from "@alice-localization/base/Translation";
import { CompareStrings } from "../CompareLocalization";

/**
 * The Spanish translation for the `compare` command.
 */
export class CompareESTranslation extends Translation<CompareStrings> {
    override readonly translations: CompareStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        noCachedBeatmap:
            "Lo siento, no hay ningún mapa siendo tema de conversación en este canal!",
        playerNotFound:
            "Lo siento, no puedo encontrar al jugador que estas buscando!",
        selfScoreNotFound:
            "Lo siento, no tienes ninguna puntuación en este mapa!",
        userScoreNotFound:
            "Lo siento, este usuario no tiene ninguna puntuación en esta mapa!",
        comparePlayDisplay: "Comparación de %s: ",
    };
}
