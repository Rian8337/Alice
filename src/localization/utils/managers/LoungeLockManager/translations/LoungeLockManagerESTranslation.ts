import { Translation } from "@alice-localization/base/Translation";
import { LoungeLockManagerStrings } from "../LoungeLockManagerLocalization";

/**
 * The Spanish translation for the `LoungeLockManager` manager utility.
 */
export class LoungeLockManagerESTranslation extends Translation<LoungeLockManagerStrings> {
    override readonly translations: LoungeLockManagerStrings = {
        userNotLocked: "El usuario no esta bloqueado de #fancy-lounge",
        lockUserNotification: "",
        unlockUserNotification: "",
    };
}
