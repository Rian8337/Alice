import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TriviaENTranslation } from "./translations/TriviaENTranslation";
import { TriviaIDTranslation } from "./translations/TriviaIDTranslation";
import { TriviaKRTranslation } from "./translations/TriviaKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<TriviaStrings>
    > = {
        en: new TriviaENTranslation(),
        kr: new TriviaKRTranslation(),
        id: new TriviaIDTranslation(),
    };
}
