import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RecentStrings {
    readonly tooManyOptions: string;
    readonly playerNotFound: string;
    readonly playerHasNoRecentPlays: string;
    readonly playIndexOutOfBounds: string;
    readonly recentPlayDisplay: string;
}

/**
 * Localizations for the `recent` command.
 */
export class RecentLocalization extends Localization<RecentStrings> {
    protected override readonly translations: Readonly<
        Translation<RecentStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            playerNotFound:
                "I'm sorry, I cannot find the player that you are looking for!",
            playerHasNoRecentPlays:
                "I'm sorry, this player has not submitted any scores!",
            playIndexOutOfBounds:
                "I'm sorry, this player does not have a %s-th recent play!",
            recentPlayDisplay: "Recent play for %s:",
        },
        kr: {
            tooManyOptions:
                "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
            playerNotFound: "죄송해요, 찾으시는 유저를 찾지 못했어요!",
            playerHasNoRecentPlays:
                "죄송해요, 이 유저는 아무 기록도 제출하지 않았어요!",
            playIndexOutOfBounds:
                "죄송해요, 이 유저는 %s번째 최근 기록이 없어요!",
            recentPlayDisplay: "%s의 최근 플레이 기록:",
        },
        id: {
            tooManyOptions: "",
            playerNotFound: "",
            playerHasNoRecentPlays: "",
            playIndexOutOfBounds: "",
            recentPlayDisplay: "",
        },
    };
}
