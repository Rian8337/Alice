import { Localization } from "@localization/base/Localization";
import { Translations } from "@localization/base/Translations";
import { BirthdayENTranslation } from "./translations/BirthdayENTranslation";
import { BirthdayESTranslation } from "./translations/BirthdayESTranslation";
import { BirthdayIDTranslation } from "./translations/BirthdayIDTranslation";
import { BirthdayKRTranslation } from "./translations/BirthdayKRTranslation";

export interface BirthdayStrings {
    readonly selfBirthdayNotExist: string;
    readonly userBirthdayNotExist: string;
    readonly setBirthdayFailed: string;
    readonly setBirthdaySuccess: string;
    readonly birthdayInfo: string;
    readonly date: string;
    readonly timezone: string;
}

/**
 * Localizations for the `birthday` command.
 */
export class BirthdayLocalization extends Localization<BirthdayStrings> {
    protected override readonly localizations: Readonly<
        Translations<BirthdayStrings>
    > = {
        en: new BirthdayENTranslation(),
        kr: new BirthdayKRTranslation(),
        id: new BirthdayIDTranslation(),
        es: new BirthdayESTranslation(),
    };
}
