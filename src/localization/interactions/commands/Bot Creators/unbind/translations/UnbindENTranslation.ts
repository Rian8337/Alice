import { Translation } from "@alice-localization/base/Translation";
import { UnbindStrings } from "../UnbindLocalization";

/**
 * The English translation for the `unbind` command.
 */
export class UnbindENTranslation extends Translation<UnbindStrings> {
    override readonly translations: UnbindStrings = {
        invalidUid: "Hey, please enter a valid uid!",
        uidNotBinded: "I'm sorry, the uid is not bound!",
        unbindFailed: "I'm sorry, I couldn't unbind the uid: %s.",
        unbindSuccessful: "Successfully unbinded uid %s.",
    };
}
