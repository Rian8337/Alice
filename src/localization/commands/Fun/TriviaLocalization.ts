import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TriviaStrings {
    readonly channelHasTriviaQuestionActive: string;
    readonly channelHasMapTriviaActive: string;
    readonly mapTriviaStarted: string;
    readonly couldNotRetrieveBeatmaps: string;
    readonly categoryHasNoQuestionType: string;
    readonly beatmapHint: string;
    readonly beatmapArtist: string;
    readonly beatmapTitle: string;
    readonly beatmapSource: string;
    readonly guessBeatmap: string;
    readonly outOfLives: string;
    readonly incorrectCharacterGuess: string;
    readonly correctCharacterGuess: string;
    readonly beatmapInfo: string;
    readonly beatmapCorrect: string;
    readonly beatmapIncorrect: string;
    readonly gameInfo: string;
    readonly starter: string;
    readonly timeStarted: string;
    readonly duration: string;
    readonly level: string;
    readonly leaderboard: string;
    readonly none: string;
    readonly gameEnded: string;
    readonly chooseCategory: string;
    readonly choiceRecorded: string;
    readonly correctAnswerGotten: string;
    readonly correctAnswerNotGotten: string;
    readonly oneCorrectAnswer: string;
    readonly multipleCorrectAnswers: string;
}

/**
 * Localizations for the `trivia` command.
 */
export class TriviaLocalization extends Localization<TriviaStrings> {
    protected override readonly translations: Readonly<
        Translation<TriviaStrings>
    > = {
        en: {
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
        },
    };
}
