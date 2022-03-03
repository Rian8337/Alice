import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { UserBindENTranslation } from "./translations/UserBindENTranslation";
import { UserBindESTranslation } from "./translations/UserBindESTranslation";
import { UserBindIDTranslation } from "./translations/UserBindIDTranslation";
import { UserBindKRTranslation } from "./translations/UserBindKRTranslation";

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
    protected override readonly localizations: Readonly<
        Translations<UserBindStrings>
    > = {
        en: new UserBindENTranslation(),
        kr: new UserBindKRTranslation(),
        id: new UserBindIDTranslation(),
        es: new UserBindESTranslation(),
    };
}
