import { Translation } from "@alice-localization/base/Translation";
import { PPcheckStrings } from "../PPcheckLocalization";

/**
 * The Indonesian translation for the `ppcheck` command.
 */
export class PPcheckIDTranslation extends Translation<PPcheckStrings> {
    override readonly translations: PPcheckStrings = {
        tooManyOptions: "",
    };
}
