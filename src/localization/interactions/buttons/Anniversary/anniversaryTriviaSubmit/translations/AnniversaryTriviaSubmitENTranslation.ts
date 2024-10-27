import { Translation } from "@localization/base/Translation";
import { AnniversaryTriviaSubmitStrings } from "../AnniversaryTriviaSubmitLocalization";

/**
 * The English translation for the `anniversaryTriviaSubmit` button command.
 */
export class AnniversaryTriviaSubmitENTranslation extends Translation<AnniversaryTriviaSubmitStrings> {
    override readonly translations: AnniversaryTriviaSubmitStrings = {
        confirmSubmission: "Are you sure you want to submit this attempt?",
        submissionSuccess: "Attempt submitted! You gained %s out of %s marks!",
    };
}
