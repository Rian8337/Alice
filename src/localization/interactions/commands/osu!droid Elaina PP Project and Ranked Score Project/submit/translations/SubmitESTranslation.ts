import { Translation } from "@alice-localization/base/Translation";
import { SubmitStrings } from "../SubmitLocalization";

/**
 * The Spanish translation for the `submit` command.
 */
export class SubmitESTranslation extends Translation<SubmitStrings> {
    override readonly translations: SubmitStrings = {
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
        scoreUsesForceAR: "Lo siento, AR modificado no esta permitido!",
        scoreUsesCustomSpeedMultiplier:
            "Lo siento, la modificación de velocidad no esta permitida!",
        submitSuccessful:
            "Puntaje(s) registrados correctamente. Más información a continuación.",
        profileNotFound: "Lo siento, no puedo encontrar tu perfil!",
        totalPP: "PP Total",
        ppGained: "PP Obtenido",
        ppSubmissionInfo: "Información de PP registrada",
        blacklistedBeatmapReject: "Mapa vetado",
        unrankedBeatmapReject: "Mapa sin rankear",
        beatmapTooShortReject: "Mapa demasiado corto",
        unrankedFeaturesReject: "Características no rankeables",
        beatmapNotFoundReject: "Mapa no encontrado",
    };
}
