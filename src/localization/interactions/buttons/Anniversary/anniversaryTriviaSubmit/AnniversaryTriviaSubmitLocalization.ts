import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { AnniversaryTriviaSubmitENTranslation } from "./translations/AnniversaryTriviaSubmitENTranslation";

export interface AnniversaryTriviaSubmitStrings {
    readonly confirmSubmission: string;
    readonly submissionSuccess: string;
}

/**
 * Localizations for the `anniversaryTriviaSubmit` button command.
 */
export class AnniversaryTriviaSubmitLocalization extends Localization<AnniversaryTriviaSubmitStrings> {
    protected override readonly localizations: Readonly<
        Translations<AnniversaryTriviaSubmitStrings>
    > = {
        en: new AnniversaryTriviaSubmitENTranslation(),
    };
}
