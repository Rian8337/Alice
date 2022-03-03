import { Translation } from "@alice-localization/base/Translation";
import { DailyStrings } from "../DailyLocalization";

/**
 * The Spanish translation for the `daily` command.
 */
export class DailyESTranslation extends Translation<DailyStrings> {
    override readonly translations: DailyStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
        noOngoingChallenge: "Lo siento, por ahora no hay jugadores!",
        challengeNotFound:
            "Lo siento, no hay ningun desafio en estos momentos!",
        challengeFromReplayNotFound:
            "Lo siento, no puedo encontrar el desafio!",
        startChallengeFailed:
            "Lo siento, no puedo encontrar el desafio asociado a ese replay!",
        startChallengeSuccess: "Lo siento, no pude iniciar el desafio: %s.",
        userHasPlayedChallenge: "Desafio %s iniciado correctamente.",
        userHasNotPlayedChallenge:
            "El jugador ha hecho el desafio %s, obteniendo %s como nivel de bonus mas alto.",
        userHasNotPlayedAnyChallenge: "El jugador no ha hecho el desafio %s.",
        scoreNotFound: "Lo siento, este usuario no ha hecho ningún desafio!",
        challengeNotOngoing:
            "Lo siento, no has jugado aún el mapa del desafio!",
        challengeNotCompleted:
            "Lo siento, este desafio no ha sido empezado, o ya ha terminado!",
        challengeCompleted:
            "Felicitaciones! Has completado el desafio %s con el nivel %s de desafio, obteniendo %s punto(s) y %s monedas Alice! Actualmente tienes %s punto(s) y %s monedas.",
        invalidReplayURL: "Hey, por favor ingresa una URL valida!",
        replayDownloadFail: "Lo siento, no pudo descargar tu replay!",
        replayInvalid:
            "Hey, por favor brinda un link de descarga correcto a tu replay!",
        replayDoesntHaveSameUsername:
            "Lo siento, esa replay no contiene el mismo nick que tu cuenta enlazada de osu!droid!",
        replayTooOld: "Lo siento, ese formato del replay es muy viejo!",
        manualSubmissionConfirmation:
            "Por favor, pregunta a algún miembro del staff para que confirme la subida manual!",
        aboutTitle: "Desafios Diarios/Semanales de osu!droid",
        aboutDescription:
            "Este es un sistema que proporciona desafios tanto diarios como semanales para que puedas completar. Consigue puntos y %smonedas Alice mientras los completas!",
        aboutQuestion1: "Como funciona?",
        aboutAnswer1:
            "Diariamente, habrán nuevos desafios para completar. Cada desafio otorgará diferentes cantidades de puntos dependiendo de que tan dificil es. Puedes obtener puntos y %s monedas Alice completando el desafio. Tambien habrán ciertos bonus que te permitiran ganar aun más puntos y %smonedas Alice! Cada nivel adicional se convertirá en `2` puntos de desafio, los cuales se convertiran a %s`4` monedas Alice.\n\n El desafio semanal, el cual solo es una vez por semana, da muchos mas puntos y %smonedas Alice, ya que este desafio es considerablemente más dificil que cualquier desafio diario. Es por eso que tienen una semana para completarlo!",
        aboutQuestion2: "Como puedo completar los desafios?",
        aboutAnswer2:
            "Habrá un mapa por separado que podrás descargar en caso ya hayas jugado el mapa original. De hecho, tu **debes** descargar dicho mapa aparte para poder registrar tu puntaje.\n\nUna vez se complete el desafio, deberas usar el comando `/daily submit` para poder registrarlo.",
        aboutQuestion3: "Como puedo usar mis puntos y monedas Alice?",
        aboutAnswer3:
            "De momento, los puntos no tienen ningun uso. Sin embargo, las %smonedas Alice pueden ser usadas para clanes y customización.",
        aboutQuestion4: "Hay algun ranking de puntos y monedas Alice?",
        aboutAnswer4:
            "No hay ninguna tabla de %sMonedas Alice, sin embargo si hay una para los puntos. Puedes usar `/daily leaderboard` para ver la tabla.",
        aboutQuestion5: "Tengo más preguntas que no han sido mencionadas aqui!",
        aboutAnswer5:
            "Puedes hablar con <@386742340968120321> para tener más información acerca de los desafios diarios y semanales.",
        username: "Nick",
        uid: "UID",
        points: "Puntos",
        scoreStatistics: "Estadísticas del puntaje",
        totalScore: "Puntuación total",
        maxCombo: "Combo total",
        accuracy: "Precisión",
        rank: "Rank",
        time: "Fecha",
        hitGreat: "Hit Great (300)",
        hitGood: "Hit Good (100)",
        hitMeh: "Hit Meh (50)",
        misses: "Misses",
        bonusLevelReached: "Nivel de bonus alcanzado",
        geki: "geki",
        katu: "katu",
        profile: "Perfil de Desafios Diarios/Semanales de %s",
        challengesCompleted: "Desafios completados",
        statistics: "Estadísticas",
    };
}
