import { Translation } from "@alice-localization/base/Translation";
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
        beatmapHint: "Beatmap Hint",
        beatmapArtist: "Artist",
        beatmapTitle: "Title",
        beatmapSource: "Source",
        guessBeatmap: "Guess the beatmap!",
        outOfLives: "I'm sorry, you have run out of lives to guess!",
        incorrectCharacterGuess:
            "%s has guessed an incorrect character (%s)! They have %s live(s) left.",
        correctCharacterGuess: "%s has guessed a correct character (%s)!",
        beatmapInfo: "Beatmap Information",
        beatmapCorrect:
            "Everyone got the beatmap correct (it took %s seconds)!",
        beatmapIncorrect: "No one guessed the beatmap!",
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
