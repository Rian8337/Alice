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
    };
}
