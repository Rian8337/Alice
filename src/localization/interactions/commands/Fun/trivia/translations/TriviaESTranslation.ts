import { Translation } from "@localization/base/Translation";
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
        answerIsAlreadyCorrect: "",
        beatmapHint: "Pista del mapa",
        beatmapArtist: "Artista",
        beatmapTitle: "Título",
        beatmapSource: "Fuente",
        guessBeatmap: "",
        answerArtist: "",
        answerTitle: "",
        answerModalTitle: "",
        answerModalArtistLabel: "",
        answerModalArtistPlaceholder: "",
        answerModalTitleLabel: "",
        answerModalTitlePlaceholder: "",
        answerEmbedArtistGuessTitle: "",
        answerEmbedTitleGuessTitle: "",
        beatmapInfo: "Informacion del mapa",
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
        correctAnswerGotten: "Hey, alguien dió la respuesta correcta.",
        correctAnswerNotGotten: "Parece que nadie adivinó la respuesta.",
        oneCorrectAnswer: "La respuesta correcta es",
        multipleCorrectAnswers: "Las respuestas correctas son",
    };
}
