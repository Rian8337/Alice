import { Translation } from "@localization/base/Translation";
import { BirthdayTrackingStrings } from "../BirthdayTrackingLocalization";

/**
 * The Indonesian translation for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingIDTranslation extends Translation<BirthdayTrackingStrings> {
    override readonly translations: BirthdayTrackingStrings = {
        happyBirthday:
            "Hei, aku ingin mengucapkan selamat ulang tahun padamu! Semoga kamu memiliki hari yang menyenangkan dengan keluarga, saudara, dan teman. Mohon terima kado sebesar `1,000` koin Mahiru dan role ulang tahun untuk hari ini dariku.",
    };
}
