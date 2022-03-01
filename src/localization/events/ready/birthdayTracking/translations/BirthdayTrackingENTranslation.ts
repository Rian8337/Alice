import { Translation } from "@alice-localization/base/Translation";
import { BirthdayTrackingStrings } from "../BirthdayTrackingLocalization";

/**
 * The English translation for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingENTranslation extends Translation<BirthdayTrackingStrings> {
    override readonly translations: BirthdayTrackingStrings = {
        happyBirthday:
            "Hey, I want to wish you a happy birthday! Hopefully you have a happy day with your family, friends, and relatives. Please accept this gift of `1,000` Alice coins and a temporary birthday role from me.",
    };
}
