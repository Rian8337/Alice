import { Translation } from "@localization/base/Translation";
import { AnniversaryTriviaPlayerStrings } from "../AnniversaryTriviaPlayerLocalization";

/**
 * The English translation for the `AnniversaryTriviaPlayer` database utility.
 */
export class AnniversaryTriviaPlayerENTranslation extends Translation<AnniversaryTriviaPlayerStrings> {
    override readonly translations: AnniversaryTriviaPlayerStrings = {
        embedQuestionTitle: "Question %s",
        embedQuestionMarkSingular: "mark",
        embedQuestionMarkPlural: "marks",
        embedQuestionSubmitAttempt: "Submit Attempt",
        embedQuestionFlagQuestion: "Flag Question",
        embedQuestionUnflagQuestion: "Unflag Question",
    };
}
