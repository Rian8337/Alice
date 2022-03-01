import { Translation } from "@alice-localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The Korean translation for the `skin` command.
 */
export class SkinKRTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        skinSet: "%s, 성공적으로 당신의 스킨을 <%s>로 설정했어요.",
        noSkinSetForUser: "죄송해요, 이 유저는 아무 스킨도 가지고있지 않아요!",
        userSkinInfo: "%s의 스킨: %s",
        tsukushiSite:
            "스킨 모음집을 확인하시려면, https://tsukushi.site 를 방문해 주세요",
    };
}
