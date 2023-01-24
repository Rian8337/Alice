import { Translation } from "@alice-localization/base/Translation";
import { ShowMostRecentPlayStrings } from "../ShowMostRecentPlayLocalization";

/**
 * The Korean translation for the `showMostRecentPlay` button command.
 */
export class ShowMostRecentPlayKRTranslation extends Translation<ShowMostRecentPlayStrings> {
    override readonly translations: ShowMostRecentPlayStrings = {
        userNotBinded: "",
        profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        playerHasNoRecentPlays:
            "죄송해요, 이 유저는 아무 기록도 제출하지 않았어요!",
        recentPlayDisplay: "%s의 최근 플레이 기록:",
    };
}
