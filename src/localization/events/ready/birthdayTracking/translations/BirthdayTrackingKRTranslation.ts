import { Translation } from "@alice-localization/base/Translation";
import { BirthdayTrackingStrings } from "../BirthdayTrackingLocalization";

/**
 * The Korean translation for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingKRTranslation extends Translation<BirthdayTrackingStrings> {
    override readonly translations: BirthdayTrackingStrings = {
        happyBirthday: "",
    };
}
