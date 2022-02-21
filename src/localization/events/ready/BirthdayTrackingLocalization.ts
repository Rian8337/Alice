import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface BirthdayTrackingStrings {
    readonly happyBirthday: string;
}

/**
 * Localizations for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingLocalization extends Localization<BirthdayTrackingStrings> {
    protected override readonly translations: Readonly<Translation<BirthdayTrackingStrings>> = {
        en: {
            happyBirthday: "Hey, I want to wish you a happy birthday! Hopefully you have a happy day with your family, friends, and relatives. Please accept this gift of `1,000` Alice coins and a temporary birthday role from me.",
        }
    };
}