import { Translation } from "@alice-localization/base/Translation";
import { PunishmentManagerStrings } from "../PunishmentManagerLocalization";

/**
 * The Korean translation for the `PunishmentManager` manager utility.
 */
export class PunishmentManagerKRTranslation extends Translation<PunishmentManagerStrings> {
    override readonly translations: PunishmentManagerStrings = {
        cannotFindLogChannel: "서버의 로그 채널을 찾을 수 없음",
        invalidLogChannel: "서버의 로그 채널이 텍스트 채널이 아님",
    };
}
