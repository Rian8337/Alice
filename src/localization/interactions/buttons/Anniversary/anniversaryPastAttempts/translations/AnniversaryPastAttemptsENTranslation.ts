import { Translation } from "@alice-localization/base/Translation";
import { AnniversaryPastAttemptsStrings } from "../AnniversaryPastAttemptsLocalization";

/**
 * The English translation for the `anniversaryPastAttempts` button command.
 */
export class AnniversaryPastAttemptsENTranslation extends Translation<AnniversaryPastAttemptsStrings> {
    override readonly translations: AnniversaryPastAttemptsStrings = {
        noPastAttempts:
            "I'm sorry, you have not attempted the anniversary trivia yet!",
        noFirstAttempt: "I'm sorry, you have no first attempt!",
        noSecondAttempt: "I'm sorry, you have no second attempt!",
    };
}
