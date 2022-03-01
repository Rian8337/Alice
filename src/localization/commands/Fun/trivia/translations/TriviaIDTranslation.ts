import { Translation } from "@alice-localization/base/Translation";
import { TriviaStrings } from "../TriviaLocalization";

/**
 * The Indonesian translation for the `trivia` command.
 */
export class TriviaIDTranslation extends Translation<TriviaStrings> {
    override readonly translations: TriviaStrings = {
        channelHasTriviaQuestionActive: "",
        channelHasMapTriviaActive: "",
        mapTriviaStarted: "",
        couldNotRetrieveBeatmaps: "",
        categoryHasNoQuestionType: "",
        beatmapHint: "",
        beatmapArtist: "",
        beatmapTitle: "",
        beatmapSource: "",
        guessBeatmap: "",
        outOfLives: "",
        incorrectCharacterGuess: "",
        correctCharacterGuess: "",
        beatmapInfo: "",
        beatmapCorrect: "",
        beatmapIncorrect: "",
        gameInfo: "",
        starter: "",
        timeStarted: "",
        duration: "",
        level: "",
        leaderboard: "",
        none: "",
        gameEnded: "",
        chooseCategory: "",
        choiceRecorded: "",
        correctAnswerGotten: "",
        correctAnswerNotGotten: "",
        oneCorrectAnswer: "",
        multipleCorrectAnswers: "",
    };
}
