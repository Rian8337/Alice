import { Translation } from "@alice-localization/base/Translation";
import { SelectMenuCreatorStrings } from "../SelectMenuCreatorLocalization";

/**
 * The English translation for the `SelectMenuCreator` creator utility.
 */
export class SelectMenuCreatorENTranslation extends Translation<SelectMenuCreatorStrings> {
    override readonly translations: SelectMenuCreatorStrings = {
        pleaseWait: "Please wait...",
        timedOut: "Timed out.",
    };
}
