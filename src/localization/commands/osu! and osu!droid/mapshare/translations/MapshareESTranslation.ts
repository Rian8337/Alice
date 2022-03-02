import { Translation } from "@alice-localization/base/Translation";
import { MapshareStrings } from "../MapshareLocalization";

/**
 * The Spanish translation for the `mapshare` command.
 */
export class MapshareESTranslation extends Translation<MapshareStrings> {
    override readonly translations: MapshareStrings = {
        noSubmissionWithStatus:
            "Lo siento, no hay ningun registro con estado %s ahora!",
        noBeatmapFound: "Hey, ingresa un link o ID valido del mapa!",
        noSubmissionWithBeatmap:
            "Lo siento, no hay ningún registro con ese mapa!",
        submissionIsNotPending: "Lo siento, ese registro no esta en estado %s!",
        userIsAlreadyBanned:
            "Lo siento, este usuario esta baneado de subir un registro para compartir!",
        userIsNotBanned:
            "Lo siento, este usuario no esta baneado de subir un registro para compartir!",
        beatmapIsOutdated:
            "Lo siento, el mapa fue actualizado despues del registro! Tu registro fue eliminado automaticamente.",
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
        summaryCharacterCountNotValid:
            "Lo siento, la longitud de tu resumen es actualmente de %s caracter(es) de largo! Debe tener entre 100 a 900 caracteres!",
        denyFailed: "Lo siento, no pude rechazar el registro: %s.",
        denySuccess: "Registro rechazado correctamente.",
        acceptFailed: "Lo siento, no pude aceptar el registro: %s.",
        acceptSuccess: "Registro aceptado correctamente.",
        banFailed:
            "Lo siento, no pude banear al usuario del registro de mapas: %s.",
        banSuccess:
            "Usuario baneado de registrar y compartir mapas correctamente.",
        unbanFailed:
            "Lo siento, no pude desbanear al usuario del registro de mapas: %s.",
        unbanSuccess:
            "Usuario desbaneado de registrar y compartir mapas correctamente.",
        postFailed: "Lo siento, no pude publicar el registro: %s.",
        postSuccess: "Registro posteado correctamente.",
        submitFailed: "Lo siento, no puedo registrar tu petición: %s.",
        submitSuccess: "Registro subido correctamente.",
        statusAccepted: "Aceptado",
        statusDenied: "Rechazado",
        statusPending: "Pendiente",
        statusPosted: "Publicado",
        submissionStatusList: "Registros con estado %s",
        submissionFromUser: "Registro de %s",
        userId: "ID del Usuario",
        beatmapId: "ID del Mapa",
        beatmapLink: "Link del Mapa",
        creationDate: "Fecha de Creación",
    };
}
