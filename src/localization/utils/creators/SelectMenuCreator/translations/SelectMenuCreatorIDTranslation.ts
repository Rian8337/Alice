import { Translation } from "@alice-localization/base/Translation";
import { SelectMenuCreatorStrings } from "../SelectMenuCreatorLocalization";

/**
 * The Indonesian translation for the `SelectMenuCreator` creator utility.
 */
export class SelectMenuCreatorIDTranslation extends Translation<SelectMenuCreatorStrings> {
    override readonly translations: SelectMenuCreatorStrings = {
        pleaseWait: "",
        timedOut: "",
    };
}
