import { Translation } from "@localization/base/Translation";
import { SwitchbindStrings } from "../SwitchbindLocalization";

/**
 * The English translation of the `switchbind` command.
 */
export class SwitchbindENTranslation extends Translation<SwitchbindStrings> {
    override readonly translations: SwitchbindStrings = {
        invalidUid: "Hey, please enter a valid uid!",
        uidNotBinded: "I'm sorry, this uid is not bound to anyone!",
        switchFailed: "I'm sorry, I'm unable to switch the bind: %s.",
        switchSuccessful: "Successfully switched bind.",
    };
}
