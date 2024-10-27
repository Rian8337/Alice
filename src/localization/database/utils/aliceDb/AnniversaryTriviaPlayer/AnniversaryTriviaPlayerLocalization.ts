import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { AnniversaryTriviaPlayerENTranslation } from "./translations/AnniversaryTriviaPlayerENTranslation";

export interface AnniversaryTriviaPlayerStrings {
    readonly embedQuestionTitle: string;
    readonly embedQuestionMarkSingular: string;
    readonly embedQuestionMarkPlural: string;
    readonly embedQuestionSubmitAttempt: string;
    readonly embedQuestionFlagQuestion: string;
    readonly embedQuestionUnflagQuestion: string;
}

/**
 * Localizations for the `AnniversaryTriviaPlayer` database utility.
 */
export class AnniversaryTriviaPlayerLocalization extends Localization<AnniversaryTriviaPlayerStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryTriviaPlayerStrings>
    > = {
        en: new AnniversaryTriviaPlayerENTranslation(),
    };
}
