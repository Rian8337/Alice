import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TriviaMapAnswerENTranslation } from "./translations/TriviaMapAnswerENTranslation";
import { TriviaMapAnswerESTranslation } from "./translations/TriviaMapAnswerESTranslation";
import { TriviaMapAnswerIDTranslation } from "./translations/TriviaMapAnswerIDTranslation";
import { TriviaMapAnswerKRTranslation } from "./translations/TriviaMapAnswerKRTranslation";

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
        es: new TriviaMapAnswerESTranslation(),
        id: new TriviaMapAnswerIDTranslation(),
        kr: new TriviaMapAnswerKRTranslation(),
    };
}
