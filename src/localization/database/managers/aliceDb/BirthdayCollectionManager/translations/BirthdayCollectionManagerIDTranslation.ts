import { Translation } from "@alice-localization/base/Translation";
import { BirthdayCollectionManagerStrings } from "../BirthdayCollectionManagerLocalization";

/**
 * The Indonesian translation for the `BirthdayCollectionManager` database collection manager.
 */
export class BirthdayCollectionManagerIDTranslation extends Translation<BirthdayCollectionManagerStrings> {
    override readonly translations: BirthdayCollectionManagerStrings = {
        birthdayIsSet: "",
        invalidDate: "",
        invalidMonth: "",
        invalidTimezone: "",
    };
}
