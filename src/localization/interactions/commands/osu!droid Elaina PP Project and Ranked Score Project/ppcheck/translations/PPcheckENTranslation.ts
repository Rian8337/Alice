import { Translation } from "@alice-localization/base/Translation";
import { PPcheckStrings } from "../PPcheckLocalization";

/**
 * The English translation for the `ppcheck` command.
 */
export class PPcheckENTranslation extends Translation<PPcheckStrings> {
    override readonly translations: PPcheckStrings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
    };
}
