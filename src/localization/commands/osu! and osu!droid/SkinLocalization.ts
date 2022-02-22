import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SkinStrings {
    readonly skinSet: string;
    readonly noSkinSetForUser: string;
    readonly userSkinInfo: string;
    readonly tsukushiSite: string;
}

/**
 * Localizations for the `skin` command.
 */
export class SkinLocalization extends Localization<SkinStrings> {
    protected override readonly translations: Readonly<
        Translation<SkinStrings>
    > = {
        en: {
            skinSet: "%s, successfully set your skin to <%s>.",
            noSkinSetForUser: "I'm sorry, this user doesn't have any skins!",
            userSkinInfo: "%s's skin: %s",
            tsukushiSite:
                "For a collection of skins, visit https://tsukushi.site",
        },
        kr: {
            skinSet: "%s, 성공적으로 당신의 스킨을 <%s>로 설정했어요.",
            noSkinSetForUser:
                "죄송해요, 이 유저는 아무 스킨도 가지고있지 않아요!",
            userSkinInfo: "%s의 스킨: %s",
            tsukushiSite:
                "스킨 모음집을 확인하시려면, https://tsukushi.site 를 방문해 주세요",
        },
    };
}
