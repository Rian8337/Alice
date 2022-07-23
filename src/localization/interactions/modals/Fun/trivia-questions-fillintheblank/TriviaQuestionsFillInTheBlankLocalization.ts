import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TriviaQuestionsFillInTheBlankENTranslation } from "./translations/TriviaQuestionsFillInTheBlankENTranslation";

export interface TriviaQuestionsFillInTheBlankStrings {
    readonly noOngoingQuestionInChannel: string;
    readonly answerRecorded: string;
}

/**
 * Localizations for the `trivia-questions-fillintheblank` modal command.
 */
export class TriviaQuestionsFillInTheBlankLocalization extends Localization<TriviaQuestionsFillInTheBlankStrings> {
    protected override readonly localizations: Readonly<
        Translations<TriviaQuestionsFillInTheBlankStrings>
    > = {
        en: new TriviaQuestionsFillInTheBlankENTranslation(),
    };
}
