import { Translation } from "@alice-localization/base/Translation";
import { AnniversaryPastEventAttemptStrings } from "../AnniversaryPastEventAttemptLocalization";

export class AnniversaryPastEventAttemptENTranslation extends Translation<AnniversaryPastEventAttemptStrings> {
    override readonly translations: AnniversaryPastEventAttemptStrings = {
        noPastAttempts:
            "I'm sorry, you have not attempted the anniversary trivia yet!",
        noFirstAttempt: "I'm sorry, you have no first attempt!",
        noSecondAttempt: "I'm sorry, you have no second attempt!",
    };
}
