import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface BirthdayCollectionManagerStrings {
    readonly birthdayIsSet: string;
    readonly invalidDate: string;
    readonly invalidMonth: string;
    readonly invalidTimezone: string;
}

/**
 * Localizations for the `BirthdayCollectionManager` database collection manager.
 */
export class BirthdayCollectionManagerLocalization extends Localization<BirthdayCollectionManagerStrings> {
    protected override readonly translations: Readonly<Translation<BirthdayCollectionManagerStrings>> = {
        en: {
            birthdayIsSet: "birthday is already set",
            invalidDate: "invalid birthday date",
            invalidMonth: "invalid birthday month",
            invalidTimezone: "invalid timezone",
        }
    };
}