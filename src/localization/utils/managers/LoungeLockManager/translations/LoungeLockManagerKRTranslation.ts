import { Translation } from "@alice-localization/base/Translation";
import { LoungeLockManagerStrings } from "../LoungeLockManagerLocalization";

/**
 * The Korean translation for the `LoungeLockManager` manager utility.
 */
export class LoungeLockManagerKRTranslation extends Translation<LoungeLockManagerStrings> {
    override readonly translations: LoungeLockManagerStrings = {
        userNotLocked: "유저가 라운지로부터 잠겨있지 않음",
    };
}
