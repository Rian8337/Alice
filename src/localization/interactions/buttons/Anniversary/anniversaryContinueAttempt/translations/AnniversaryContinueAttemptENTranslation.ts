import { Translation } from "@alice-localization/base/Translation";
import { AnniversaryContinueAttemptStrings } from "../AnniversaryContinueAttemptLocalization";

/**
 * The English translation for the `anniversaryContinueAttempt` button command.
 */
export class AnniversaryContinueAttemptENTranslation extends Translation<AnniversaryContinueAttemptStrings> {
    override readonly translations: AnniversaryContinueAttemptStrings = {
        noExistingAttempt: "I'm sorry, you do not have an existing attempt!",
    };
}
