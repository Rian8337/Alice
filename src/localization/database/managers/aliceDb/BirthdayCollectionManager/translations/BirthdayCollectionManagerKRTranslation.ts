import { Translation } from "@alice-localization/base/Translation";
import { BirthdayCollectionManagerStrings } from "../BirthdayCollectionManagerLocalization";

/**
 * The Korean translation for the `BirthdayCollectionManager` database collection manager.
 */
export class BirthdayCollectionManagerKRTranslation extends Translation<BirthdayCollectionManagerStrings> {
    override readonly translations: BirthdayCollectionManagerStrings = {
        birthdayIsSet: "",
        invalidDate: "",
        invalidMonth: "",
        invalidTimezone: "",
    };
}
