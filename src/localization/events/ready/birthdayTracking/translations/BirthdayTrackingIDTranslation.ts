import { Translation } from "@alice-localization/base/Translation";
import { BirthdayTrackingStrings } from "../BirthdayTrackingLocalization";

/**
 * The Indonesian translation for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingIDTranslation extends Translation<BirthdayTrackingStrings> {
    override readonly translations: BirthdayTrackingStrings = {
        happyBirthday: "",
    };
}
