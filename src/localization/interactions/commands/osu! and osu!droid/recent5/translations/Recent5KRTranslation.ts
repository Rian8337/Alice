import { Translation } from "@localization/base/Translation";
import { Recent5Strings } from "../Recent5Localization";

/**
 * The Korean translation for the `recent5` command.
 */
export class Recent5KRTranslation extends Translation<Recent5Strings> {
    override readonly translations: Recent5Strings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        playerNotFound: "죄송해요, 찾으시는 유저를 찾지 못했어요!",
        playerHasNoRecentPlays:
            "죄송해요, 이 유저는 아무 기록도 제출하지 않았어요!",
    };
}
