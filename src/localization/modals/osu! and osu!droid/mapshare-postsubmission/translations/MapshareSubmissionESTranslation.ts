import { Translation } from "@alice-localization/base/Translation";
import { MapshareSubmissionStrings } from "../MapshareSubmissionLocalization";

/**
 * The Spanish translation for the `mapshare-postsubmission` modal command.
 */
export class MapshareSubmissionESTranslation extends Translation<MapshareSubmissionStrings> {
    override readonly translations: MapshareSubmissionStrings = {
        noBeatmapFound: "Hey, ingresa un link o ID valido del mapa!",
        beatmapIsTooEasy:
            "Lo siento, solo puedes registrar mapa que sean de 3* a más!",
        beatmapHasLessThan50Objects:
            "Lo siento, parece ser que el mapa tiene menos de 50 objetos en él!",
        beatmapHasNoCirclesOrSliders:
            "Lo siento, ese mapa no tiene circulos ni sliders!",
        beatmapDurationIsLessThan30Secs:
            "Lo siento, la duración del mapa es demasiado corta! Debe ser de al menos 30 segundos.",
        beatmapIsWIPOrQualified:
            "Lo siento, no puedes registrar un mapa en estado WIP (Aun en trabajo) ni mapas calificados!",
        beatmapWasJustSubmitted:
            "Lo siento, este mapa fue subido hace menos de una semana!",
        beatmapWasJustUpdated:
            "Lo siento, este mapa fue actualizado hace menos de 3 dias!",
        beatmapHasBeenUsed:
            "Lo siento, este mapa ha sido registrado anteriormente!",
        summaryWordCountNotValid:
            "Lo siento, la longitud de tu resumen es actualmente de %s palabra(s)! Debe tener entre 50 a 120 palabras!",
        submitFailed: "Lo siento, no puedo registrar tu petición: %s.",
        submitSuccess: "Registro subido correctamente.",
    };
}
