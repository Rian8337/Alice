import { Translation } from "@alice-localization/base/Translation";
import { MatchStrings } from "../MatchLocalization";

/**
 * The Spanish translation for the `match` command.
 */
export class MatchESTranslation extends Translation<MatchStrings> {
    override readonly translations: MatchStrings = {
        invalidMatchID:
            "Hey, por favor respeta el orden del ID para el versus!",
        matchIDAlreadyTaken: "Lo siento, ya existe un versus con el mismo ID!",
        teamPlayerCountDoNotBalance:
            "Lo siento, la diferencia de jugadores entre ambos equipos no debe exceder a 1!",
        invalidPlayerInformation:
            "Lo siento, la información de este jugador es incorrecta: %s.",
        invalidChannelToBind:
            "Hey, solo puedes enlazar versus en un canal de texto!",
        matchDoesntExist:
            "Lo siento, ese versus no existe o este canal/hilo no esta enlazado a ninguno!",
        matchHasEnded: "Lo siento, el versus ha terminado!",
        matchHasNoResult: "Lo siento, este versus no tiene resultados aun!",
        mappoolNotFound: "Lo siento, no puedo encontrar la lista de mapas!",
        mapNotFound:
            "Lo siento, no puedo encontrar el mapa que fue jugado recientemente!",
        playerNotFound: "Lo siento, no puedo encontrar el perfil del UID %s!",
        matchDataInProcess: "Procesando resultados. Por favor espere...",
        roundInitiated: "Ronda iniciada!",
        roundCountdownFinished:
            "El tiempo de juego ha terminado. Tiempo de espera extra de 30 segundos.",
        roundEnded: "Ronda terminada!",
        teamPlayerCountDoesntMatch:
            "Lo siento, la información no concuerda. El equipo %s tiene %s jugador(es). Tu solo ingresaste información de %s jugadores.",
        scoreDataInvalid:
            "Lo siento, la información del puntaje del team % / jugador % es inválido: %s.",
        addMatchFailed: "Lo siento, no pude agregar el versus: %s.",
        addMatchSuccessful: "Versus %s agregado correctamente.",
        bindMatchFailed: "Lo siento, no pude enlazar el versus: %s.",
        bindMatchSuccessful:
            "Versus %s enlazado correctamente a este canal. Por favor revisar la sección de hilos.",
        endMatchFailed: "Lo siento, no pude terminar el versus: %s.",
        endMatchSuccessful: "Versus %s finalizado correctamente.",
        removeMatchFailed: "Lo siento, no pude eliminar el versus: %s.",
        removeMatchSuccessful: "Versus %s eliminado correctamente.",
        undoMatchFailed:
            "Lo siento, no pude revertir el resultado del versus: %s.",
        undoMatchSuccessful:
            "Resultados del versus %s revertidos correctamente.",
        unbindMatchFailed: "Lo siento, no pude remover el versus: %s.",
        unbindMatchSuccessful: "Versus %s removido correctamente.",
        submitMatchFailed:
            "Lo siento, no pude ingresar los resultados del versus: %s.",
        submitMatchSuccessful: "Resultados actualizados correctamente.",
        failed: "Falló.",
        none: "Nada",
        draw: "Es un empate.",
        won: "%s ganó por %s",
        roundInfo: "Información de la ronda",
        matchId: "ID del versus",
        map: "Mapa",
        mapLength: "Duración del mapa",
    };
}
