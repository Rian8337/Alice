import { Translation } from "@localization/base/Translation";
import { TriviaStrings } from "../TriviaLocalization";

/**
 * The English translation for the `trivia` command.
 */
export class TriviaENTranslation extends Translation<TriviaStrings> {
    override readonly translations: TriviaStrings = {
        channelHasTriviaQuestionActive:
            "Hey, this channel has an active trivia question! Please answer that one first!",
        channelHasMapTriviaActive:
            "Hey, this channel has an active map trivia! Please play that one!",
        mapTriviaStarted: "Game started!",
        couldNotRetrieveBeatmaps:
            "I'm sorry, I'm unable to retrieve a beatmap, therefore the game has been ended!",
        categoryHasNoQuestionType:
            "I'm sorry, the selected question category (%s) does not have any question of the type that you have requested!",
        answerIsAlreadyCorrect:
            "I'm sorry, you have already guessed the correct artist and title!",
        beatmapHint: "Beatmap Hint",
        beatmapArtist: "Artist",
        beatmapTitle: "Title",
        beatmapSource: "Source",
        guessBeatmap: "Guess the beatmap!",
        answerArtist: "Guess Artist",
        answerTitle: "Guess Title",
        answerModalTitle: "Beatmap Trivia Answer Submission",
        answerModalArtistLabel: "Beatmap Artist",
        answerModalArtistPlaceholder:
            "Enter your guess for the beatmap's artist.",
        answerModalTitleLabel: "Beatmap Title",
        answerModalTitlePlaceholder:
            "Enter your guess for the beatmap's title.",
        answerEmbedArtistGuessTitle: "Artist",
        answerEmbedTitleGuessTitle: "Title",
        beatmapInfo: "Beatmap Information",
        gameInfo: "Game Information",
        starter: "Starter",
        timeStarted: "Time started",
        duration: "Duration",
        level: "Level",
        leaderboard: "Leaderboard",
        none: "None",
        gameEnded: "Game ended!",
        chooseCategory: "Choose the category that you want to enforce.",
        choiceRecorded: "Your latest choice (%s) has been recorded!",
        correctAnswerGotten: "Hey, someone got that correctly.",
        correctAnswerNotGotten: "Looks like no one got that right.",
        oneCorrectAnswer: "The correct answer is",
        multipleCorrectAnswers: "Correct answers are",
    };
}
