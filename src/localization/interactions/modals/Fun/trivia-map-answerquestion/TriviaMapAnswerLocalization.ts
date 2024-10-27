import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { TriviaMapAnswerENTranslation } from "./translations/TriviaMapAnswerENTranslation";

export interface TriviaMapAnswerStrings {
    readonly noOngoingTrivia: string;
    readonly answerRecorded: string;
}

/**
 * Localizations for the `trivia-map-answer` modal command.
 */
export class TriviaMapAnswerLocalization extends Localization<TriviaMapAnswerStrings> {
    protected override readonly localizations: Readonly<
        Translations<TriviaMapAnswerStrings>
    > = {
        en: new TriviaMapAnswerENTranslation(),
    };
}
