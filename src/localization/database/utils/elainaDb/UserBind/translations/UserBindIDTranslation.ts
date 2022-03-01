import { Translation } from "@alice-localization/base/Translation";
import { UserBindStrings } from "../UserBindLocalization";

/**
 * The Indonesian translation for the `UserBind` database utility.
 */
export class UserBindIDTranslation extends Translation<UserBindStrings> {
    override readonly translations: UserBindStrings = {
        uidNotBindedToAccount: "",
        cannotRebindToSameAccount: "",
        bindLimitReachedInOtherAccount: "",
        playerNotFound: "",
        playerWithUidOrUsernameNotFound: "",
        bindLimitReached: "",
        unbindClanDisbandNotification: "",
    };
}
