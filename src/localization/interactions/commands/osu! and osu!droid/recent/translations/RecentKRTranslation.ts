import { Translation } from "@alice-localization/base/Translation";
import { RecentStrings } from "../RecentLocalization";

/**
 * The Korean translation for the `recent` command.
 */
export class RecentKRTranslation extends Translation<RecentStrings> {
    override readonly translations: RecentStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        playerNotFound: "죄송해요, 찾으시는 유저를 찾지 못했어요!",
        playerHasNoRecentPlays:
            "죄송해요, 이 유저는 아무 기록도 제출하지 않았어요!",
        playIndexOutOfBounds: "죄송해요, 이 유저는 %s번째 최근 기록이 없어요!",
        recentPlayDisplay: "%s의 최근 플레이 기록:",
    };
}
