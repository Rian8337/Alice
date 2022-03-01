import { Translation } from "@alice-localization/base/Translation";
import { LoungeLockManagerStrings } from "../LoungeLockManagerLocalization";

/**
 * The Indonesian translation for the `LoungeLockManager` manager utility.
 */
export class LoungeLockManagerIDTranslation extends Translation<LoungeLockManagerStrings> {
    override readonly translations: LoungeLockManagerStrings = {
        userNotLocked: "",
    };
}
