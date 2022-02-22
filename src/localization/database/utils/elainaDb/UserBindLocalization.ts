import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UserBindStrings {
    readonly uidNotBindedToAccount: string;
    readonly cannotRebindToSameAccount: string;
    readonly bindLimitReachedInOtherAccount: string;
    readonly playerNotFound: string;
    readonly playerWithUidOrUsernameNotFound: string;
    readonly bindLimitReached: string;
    readonly unbindClanDisbandNotification: string;
}

/**
 * Localizations for the `UserBind` database utility.
 */
export class UserBindLocalization extends Localization<UserBindStrings> {
    protected override readonly translations: Readonly<
        Translation<UserBindStrings>
    > = {
        en: {
            uidNotBindedToAccount: "uid is not binded to this Discord account",
            cannotRebindToSameAccount:
                "cannot rebind to the same Discord account",
            bindLimitReachedInOtherAccount:
                "bind limit reached in other Discord account",
            playerNotFound: "player not found",
            playerWithUidOrUsernameNotFound:
                "player with such uid or username is not found",
            bindLimitReached: "account bind limit reached",
            unbindClanDisbandNotification:
                "Hey, your Discord account has been unbinded from any osu!droid accounts! Therefore, your clan has been disbanded!",
        },
        kr: {
            uidNotBindedToAccount:
                "uid가 이 디스코드 계정에 바인딩 되어있지 않음",
            cannotRebindToSameAccount:
                "같은 디스코드 계정에 다시 바인드 할 수 없음",
            bindLimitReachedInOtherAccount:
                "다른 디스코드 계정이 바인딩 최대치에 도달함",
            playerNotFound: "플레이어가 발견되지 않음",
            playerWithUidOrUsernameNotFound:
                "해당 uid나 유저네임의 플레이어가 발견되지 않음",
            bindLimitReached: "계정이 바인딩 최대치에 도달",
            unbindClanDisbandNotification:
                "저기, 당신의 디스코드 계정이 모든 osu!droid 계정들로부터 바인드가 해제되었어요! 따라서, 당신의 클랜이 해체되었어요!",
        },
    };
}
