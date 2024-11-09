import { Translation } from "@localization/base/Translation";
import { UserBindStrings } from "../UserBindLocalization";

/**
 * The English translation for the `UserBind` database utility.
 */
export class UserBindENTranslation extends Translation<UserBindStrings> {
    override readonly translations: UserBindStrings = {
        uidNotBindedToAccount: "uid is not bound to this Discord account",
        playerNotFound: "player not found",
        playerWithUidOrUsernameNotFound:
            "player with such uid or username is not found",
        unbindClanDisbandNotification:
            "Hey, your Discord account has been unbinded from any osu!droid accounts! Therefore, your clan has been disbanded!",
    };
}
