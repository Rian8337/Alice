import { Translation } from "@localization/base/Translation";
import { BirthdayCollectionManagerStrings } from "../BirthdayCollectionManagerLocalization";

/**
 * The Korean translation for the `BirthdayCollectionManager` database collection manager.
 */
export class BirthdayCollectionManagerKRTranslation extends Translation<BirthdayCollectionManagerStrings> {
    override readonly translations: BirthdayCollectionManagerStrings = {
        birthdayIsSet: "생일이 이미 설정되어 있음",
        invalidDate: "유효하지 않은 날짜",
        invalidMonth: "유효하지 않은 달",
        invalidTimezone: "유효하지 않은 시간대",
    };
}
