import { Translation } from "@localization/base/Translation";
import { MathgameStrings } from "../MathgameLocalization";

/**
 * The Spanish translation for the `mathgame` command.
 */
export class MathgameESTranslation extends Translation<MathgameStrings> {
    override readonly translations: MathgameStrings = {
        userHasOngoingGame: "Hey! Hay un juego en curso! Juega ese.",
        channelHasOngoingGame:
            "Hey! Hay un juego en curso en este canal! Juega ese.",
        gameStartedNotification: "Juego iniciado!",
        couldNotFetchEquationGameEnd:
            "Desafortunadamente, el generador de ecuaciones no pudo generar ninguna ecuación despues de %s intentos! Como resultado, el juego ha finalizado.",
        noAnswerGameEnd:
            "Juego terminado! La respuesta correcta es:\n```fix\n%s = %s```Las estadisticas del juego pueden ser vistas en la siguiente etiqueta.",
        singleGamemodeQuestion:
            "%s, resuelve esta ecuación en 30 segundos!\n`Contador de operadores %s, nivel %s\n```fix\n%s = ...```",
        multiGamemodeQuestion:
            "Solve this equation within 30 seconds (level %s, %s operator(s))!\n```fix\n%s = ...```",
        correctAnswer:
            "%s respondió correctamente! Eso tomó %s segundos.\n```fix\n%s = %s```",
        gameStatistics: "Estadísticas del Juego Matemático",
        gameStarter: "Primer jugador",
        timeStarted: "El tiempo comenzó",
        duration: "Duración",
        levelReached: "Nivel alcanzado",
        operatorCount: "Contador de operadores",
        level: "Nivel",
        totalCorrectAnswers: "Total de respuesta correctas",
        answers: "Respuesta(s)",
    };
}
