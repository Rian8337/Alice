import { Translation } from "@alice-localization/base/Translation";
import { PPcheckStrings } from "../PPcheckLocalization";

/**
 * The Spanish translation for the `ppcheck` command.
 */
export class PPcheckESTranslation extends Translation<PPcheckStrings> {
    override readonly translations: PPcheckStrings = {
        tooManyOptions:
            "Lo siento, solo puedes especificar un uid, usuario o nick! No puedes combinarlos!",
    };
}
