import { Translation } from "@localization/base/Translation";
import { ViewRecentPlaysStrings } from "../ViewRecentPlaysLocalization";

/**
 * The Korean translation for the `viewRecentPlays` user context menu command.
 */
export class ViewRecentPlaysKRTranslation extends Translation<ViewRecentPlaysStrings> {
    override readonly translations: ViewRecentPlaysStrings = {
        selfProfileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        userProfileNotFound: "죄송해요, 그 유저의 프로필을 찾을 수 없었어요!",
        playerHasNoRecentPlays:
            "죄송해요, 이 유저는 아무 기록도 제출하지 않았어요!",
    };
}
