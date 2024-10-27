import { Translation } from "@localization/base/Translation";
import { MapshareStrings } from "../MapshareLocalization";

/**
 * The Spanish translation for the `mapshare` command.
 */
export class MapshareESTranslation extends Translation<MapshareStrings> {
    override readonly translations: MapshareStrings = {
        noSubmissionWithStatus:
            "Lo siento, no hay ningun registro con estado %s ahora!",
        noBeatmapFound: "Hey, ingresa un link o ID valido del mapa!",
        beatmapIsOutdated:
            "Lo siento, el mapa fue actualizado despues del registro! Tu registro fue eliminado automaticamente.",
        noSubmissionWithBeatmap:
            "Lo siento, no hay ningún registro con ese mapa!",
        submissionIsNotPending: "Lo siento, ese registro no esta en estado %s!",
        userIsAlreadyBanned:
            "Lo siento, este usuario esta baneado de subir un registro para compartir!",
        userIsNotBanned:
            "Lo siento, este usuario no esta baneado de subir un registro para compartir!",
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
        submitModalTitle: "",
        submitModalBeatmapLabel: "",
        submitModalBeatmapPlaceholder: "",
        submitModalSummaryLabel: "",
        submitModalSummaryPlaceholder: "",
    };
}
