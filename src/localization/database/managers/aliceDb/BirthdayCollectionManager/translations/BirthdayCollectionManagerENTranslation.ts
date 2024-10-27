import { Translation } from "@localization/base/Translation";
import { BirthdayCollectionManagerStrings } from "../BirthdayCollectionManagerLocalization";

/**
 * The English translation for the `BirthdayCollectionManager` database collection manager.
 */
export class BirthdayCollectionManagerENTranslation extends Translation<BirthdayCollectionManagerStrings> {
    override readonly translations: BirthdayCollectionManagerStrings = {
        birthdayIsSet: "birthday is already set",
        invalidDate: "invalid birthday date",
        invalidMonth: "invalid birthday month",
        invalidTimezone: "invalid timezone",
    };
}
