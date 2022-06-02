import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TriviaENTranslation } from "./translations/TriviaENTranslation";
import { TriviaESTranslation } from "./translations/TriviaESTranslation";
import { TriviaIDTranslation } from "./translations/TriviaIDTranslation";
import { TriviaKRTranslation } from "./translations/TriviaKRTranslation";

export interface TriviaStrings {
    readonly channelHasTriviaQuestionActive: string;
    readonly channelHasMapTriviaActive: string;
    readonly mapTriviaStarted: string;
    readonly couldNotRetrieveBeatmaps: string;
    readonly categoryHasNoQuestionType: string;
    readonly answerIsAlreadyCorrect: string;
    readonly beatmapHint: string;
    readonly beatmapArtist: string;
    readonly beatmapTitle: string;
    readonly beatmapSource: string;
    readonly guessBeatmap: string;
    readonly answerQuestion: string;
    readonly answerModalTitle: string;
    readonly answerModalArtistLabel: string;
    readonly answerModalArtistPlaceholder: string;
    readonly answerModalTitleLabel: string;
    readonly answerModalTitlePlaceholder: string;
    readonly answerEmbedArtistGuessTitle: string;
    readonly answerEmbedTitleGuessTitle: string;
    readonly beatmapInfo: string;
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
        es: new TriviaESTranslation(),
    };
}
