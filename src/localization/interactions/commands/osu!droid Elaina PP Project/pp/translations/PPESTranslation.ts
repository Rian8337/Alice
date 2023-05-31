import { Translation } from "@alice-localization/base/Translation";
import { PPStrings } from "../PPLocalization";

/**
 * The Spanish translation for the `ppcheck` command.
 */
export class PPESTranslation extends Translation<PPStrings> {
    override readonly translations: PPStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        cannotCompareSamePlayers:
            "Hey, no puedes comparar 2 jugadores iguales!",
        playerNotBinded: 'Lo siento, el %s "%s" no esta enlazado!',
        uid: "uid",
        username: "nick",
        user: "usuario",
        noSimilarPlayFound:
            "Lo siento, los jugadores no tienen puntuaciones en comun para poder comparar!",
        topPlaysComparison: "Comparación de Top Plays (Rendimiento/PP)",
        player: "Jugador",
        totalPP: "PP total",
        selfInfoNotAvailable:
            "Lo siento, tu información de prueba del dpp no está disponible!",
        userInfoNotAvailable:
            "Lo siento, la información de prueba del dpp de ese usuario no está disponible!",
        ppProfileTitle: "Perfil de PP de %s",
        prevTotalPP: "PP total anterior",
        diff: "Diferencia",
        ppProfile: "Perfil de Rendimiento (PP)",
        lastUpdate: "Ultima actualización",
        commandNotAllowed:
            "Lo siento, este comando no esta disponible en este canal.",
        uidIsBanned:
            "Lo siento, tu cuenta de osu!droid enlazada ha sido restringida de poder obtener dpp.",
        beatmapNotFound:
            "Hey, por favor ingresa un mapa válido para registrar!",
        beatmapIsBlacklisted: "Lo siento, este mapa se encuentra vetado.",
        beatmapNotWhitelisted:
            "Lo siento, este sistema de pp unicamente acepta mapas calificados, aprobados, amados o permitidos por ahora!",
        beatmapTooShort:
            "Lo siento, este mapa es, o muy corto (menos de 30 segundos) o no tiene como minimo el 60% mapeado en su totalidad.",
        noScoreSubmitted:
            "Lo siento, tu no tienes ningún puntaje registrado en este mapa!",
        noScoresInSubmittedList:
            "Lo siento, tu no tienes ningún puntaje para registrar dentro de ese rango u orden!",
        submitFailed: "",
        partialSubmitSuccessful: "",
        fullSubmitSuccessful: "Puntaje(s) registrados correctamente.",
        ppGained: "PP Obtenido",
        profileNotFound: "Lo siento, no puedo encontrar tu perfil!",
        ppSubmissionInfo: "Información de PP registrada",
        whatIfScoreNotEntered: "",
        whatIfScoreEntered: "",
    };
}
