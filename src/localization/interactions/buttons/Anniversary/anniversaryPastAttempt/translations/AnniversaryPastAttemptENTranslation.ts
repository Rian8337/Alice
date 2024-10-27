import { Translation } from "@localization/base/Translation";
import { AnniversaryPastAttemptStrings } from "../AnniversaryPastAttemptLocalization";

/**
 * The English translation for the `anniversaryPastAttempt` button command.
 */
export class AnniversaryPastAttemptENTranslation extends Translation<AnniversaryPastAttemptStrings> {
    override readonly translations: AnniversaryPastAttemptStrings = {
        noPastAttempts:
            "I'm sorry, you have not attempted the anniversary trivia yet!",
        noPastAttempt:
            "I'm sorry, you do not have a past attempt at this index! Try a more recent index.",
        selectIndex: "Please select the attempt index that you want to review.",
    };
}
