import { Translation } from "@alice-localization/base/Translation";
import { MusicStrings } from "../MusicLocalization";

/**
 * The Spanish translation for the `music` command.
 */
export class MusicESTranslation extends Translation<MusicStrings> {
    override readonly translations: MusicStrings = {
        userIsNotInVoiceChannel:
            "Lo siento, debes de estar en un canal de voz para usar este comando!",
        botIsNotInVoiceChannel:
            "Lo siento, no me encuentro conectado a un canal de voz ahora mismo!",
        noMusicIsPlaying: "Lo siento, no hay musica!",
        noTracksFound:
            "Lo siento, no pude encontrar ningun video de YouTube de tu busqueda!",
        playTrackFailed: "Lo siento, no pude reproducir la pista: %s.",
        playTrackSuccess: "Reproduciendo %s satisfactoriamente o en cola.",
        skipTrackFailed: "Lo siento, no pude saltar la pista: %s.",
        skipTrackSuccess: "Pista saltada correctamente.",
        pauseTrackFailed: "Lo siento, no pude pausar la pista: %s.",
        pauseTrackSuccess: "Pista actual pausada correctamente.",
        resumeTrackFailed: "Lo siento, no pude continuar la pista: %s.",
        resumeTrackSuccess: "Pista renaudada correctamente.",
        leaveChannelFailed:
            "Lo siento, no pude desconectarme del canal de voz: %s.",
        leaveChannelSuccess: "Desconexión del canal de voz satisfactoria.",
        repeatModeFailed:
            "Lo siento, no pude modificar el modo repetición: %s.",
        repeatModeEnableSuccess: "Modo repetición activado satisfactoriamente.",
        repeatModeDisableSuccess:
            "Modo repetición desactivado satisfactoriamente.",
        shuffleFailed: "Lo siento, no pude combinar la lista de música: %s.",
        shuffleSuccess: "Lista de musica en aleatorio cambiada correctamente.",
        addQueueFailed:
            "Lo siento, no pude agregar el video en la lista de música: %s.",
        addQueueSuccess: "%s añadido correctamente en la lista de música.",
        removeQueueFailed:
            "Lo siento, no pude eliminar %s de la lista de música: %s.",
        removeQueueSuccess: "%s eliminado correctamente de la lista de música.",
        createCollectionFailed: "Lo siento, no pude crear la lista: %s.",
        createCollectionSuccess: "Lista %s creada correctamente.",
        deleteCollectionFailed: "Lo siento, no pude eliminar la lista: %s.",
        deleteCollectionSuccess: "Lista %s eliminada correctamente.",
        addVideoToCollectionFailed:
            "Lo siento, no pude agregar el video en la lista: %s.",
        addVideoToCollectionSuccess:
            "Video añadido correctamente a la lista %s en la posicion %s.",
        removeVideoFromCollectionFailed:
            "Lo siento, no pude eliminar el video de la posición especificada: %s.",
        removeVideoFromCollectionSuccess:
            "Video en posición %s eliminado correctamente de la lista %s.",
        queueIsEmpty: "Lo siento, no hay musica en cola.",
        selfHasNoCollection: "Lo siento, no tienes ninguna lista de música.",
        userHasNoCollection:
            "Lo siento, este usuario no tiene ninguna lista de música!",
        noCollectionWithName:
            "Lo siento, no hay ninguna lista de música con ese nombre!",
        collectionWithNameAlreadyExists:
            "Lo siento, ya existe una lista de música con ese nombre.",
        userDoesntOwnCollection:
            "Lo siento, tu no eres dueño de esa lista de música!",
        collectionLimitReached:
            "Lo siento, solo puedes agregar hasta 10 videos en una lista de música!",
        enqueueFromCollectionSuccess:
            "%s video(s) agregados correctamente a la lista de música.",
        chooseVideo: "Elige un vídeo.",
        currentQueue: "Lista actual",
        requestedBy: "Solicitado por %s",
        musicInfo: "Información de la música",
        playingSince: "Reproduciendose desde",
        currentlyPlaying: "Reproduciendose actualmente",
        channel: "Canal",
        duration: "Duración",
        none: "Nada",
        playbackSettings: "Configuración de reproducción",
        repeatMode: "Modo repetición",
        enabled: "Activado",
        disabled: "Desactivado",
        queue: "Lista",
        totalCollections: "Listas Totales",
        createdAt: "Creada en %s",
        collectionOwner: "Dueño",
        creationDate: "Fecha de Creación",
        collectionLinks: "Links",
    };
}
