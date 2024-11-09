import { Translation } from "@localization/base/Translation";
import { UserBindStrings } from "../UserBindLocalization";

/**
 * The Indonesian translation for the `UserBind` database utility.
 */
export class UserBindIDTranslation extends Translation<UserBindStrings> {
    override readonly translations: UserBindStrings = {
        uidNotBindedToAccount: "uid tidak terhubung dengan akun Discord ini",
        playerNotFound: "pemain tidak ditemukan",
        playerWithUidOrUsernameNotFound:
            "pemain dengan uid atau username tersebut tidak ditemukan",
        unbindClanDisbandNotification:
            "Hei, akun Discordmu telah dilepas dari hubungan semua akun osu!droid! Oleh karena itu, klan kamu telah dibubarkan!",
    };
}
