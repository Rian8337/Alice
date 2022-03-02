import { Translation } from "@alice-localization/base/Translation";
import { TriviaStrings } from "../TriviaLocalization";

/**
 * The Spanish translation for the `trivia` command.
 */
export class TriviaESTranslation extends Translation<TriviaStrings> {
    override readonly translations: TriviaStrings = {
        channelHasTriviaQuestionActive:
            "Hey, hay una trivia activa en este canal! Por favor responde esa primero!",
        channelHasMapTriviaActive:
            "Hey, hay una trivia de mapas activa en este canal! Por favor juega ese!",
        mapTriviaStarted: "Juego iniciado!",
        couldNotRetrieveBeatmaps:
            "Lo siento, no pude recuperar el mapa, por ende el juego ha sido terminado!",
        categoryHasNoQuestionType:
            "Lo siento, la categoria de preguntas seleccionada (%s) no tiene ninguna pregunta del tipo que esta solicitando!",
        beatmapHint: "",
        beatmapArtist: "",
        beatmapTitle: "",
        beatmapSource: "",
        guessBeatmap: "",
        outOfLives:
            "Lo siento, se te acabaron las vidas para poder continuar adivinando!",
        incorrectCharacterGuess:
            "%s ha dado una respuesta incorrecta (%s)! Tienen %s vidas restantes.",
        correctCharacterGuess: "%s ha respondido de manera correcta (%s)!",
        beatmapInfo: "Informacion del mapa",
        beatmapCorrect: "Todos tienen el mapa correcto (Les tomó %s segundos)!",
        beatmapIncorrect: "Nadie adivinó el mapa!",
        gameInfo: "Informacion del juego",
        starter: "Primer jugador",
        timeStarted: "El tiempo comenzó",
        duration: "Duración",
        level: "Nivel",
        leaderboard: "Tabla",
        none: "Nada",
        gameEnded: "Juego terminado!!",
        chooseCategory: "Elige la categoría que quieres usar.",
        choiceRecorded: "Tu ultima opción (%s) ha sido guardada.",
        correctAnswerGotten: "",
        correctAnswerNotGotten: "",
        oneCorrectAnswer: "",
        multipleCorrectAnswers: "",
    };
}
