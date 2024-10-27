import { Translation } from "@localization/base/Translation";
import { AskcountStrings } from "../AskcountLocalization";

/**
 * The English translation for the `askcount` command.
 */
export class AskcountENTranslation extends Translation<AskcountStrings> {
    override readonly translations: AskcountStrings = {
        haveNotAsked: "I'm sorry, looks like you haven't asked me yet!",
        askCount: "You have asked me %s time(s).",
    };
}
