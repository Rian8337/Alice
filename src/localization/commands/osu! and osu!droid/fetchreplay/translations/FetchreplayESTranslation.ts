import { Translation } from "@alice-localization/base/Translation";
import { FetchreplayStrings } from "../FetchreplayLocalization";

/**
 * The Spanish translation for the `fetchreplay` command.
 */
export class FetchreplayESTranslation extends Translation<FetchreplayStrings> {
    override readonly translations: FetchreplayStrings = {
        beatmapNotProvided:
            "Hey, por favor ingresa primer el mapa del cual necesito encontrar el replay!",
        selfScoreNotFound:
            "Lo siento, no tienes ninguna puntuación en este mapa!",
        userScoreNotFound:
            "Lo siento, ese uid no tiene ninguna puntuación en ese mapa!",
        noReplayFound:
            "Lo siento, no puedo encontrar el replay de esa puntuación!",
        fetchReplayNoBeatmapSuccessful:
            "Replay encontrado satisfactoriamente.\n\nRank: %s\nPuntuación: %s\nCombo Máximo: %sx\nPrecisión: %s% [%s/%s/%s/%s]",
        playInfo: "Información del puntaje de %s",
        hitErrorInfo: "Información de la marca de error",
        hitErrorAvg: "Promedio de error",
    };
}
