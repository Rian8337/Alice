import { Translation } from "@alice-localization/base/Translation";
import { BirthdayTrackingStrings } from "../BirthdayTrackingLocalization";

/**
 * The Korean translation for the `birthdayTracking` event utility in `ready` event.
 */
export class BirthdayTrackingKRTranslation extends Translation<BirthdayTrackingStrings> {
    override readonly translations: BirthdayTrackingStrings = {
        happyBirthday:
            "저기, 생일 축하드려요! 가족, 친구, 친척들과 행복한 날을 보내시길 바래요! 선물로 이 `1,000` 엘리스 코인과 오늘 하루 지속되는 생일 역할을 받아주세요!",
    };
}
