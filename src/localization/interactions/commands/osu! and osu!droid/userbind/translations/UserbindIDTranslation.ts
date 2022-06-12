import { Translation } from "@alice-localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Indonesian translation for the `userbind` command.
 */
export class UserbindIDTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound:
            "Maaf, aku tidak dapat menemukan profil akun tersebut!",
        newAccountBindNotInMainServer:
            "Maaf, menghubungkan akun baru harus dilakukan di server Discord osu!droid International! Ini dibutuhkan untuk mempermudah pengawasan.",
        emailNotSpecified:
            "Maaf, kamu harus memberikan email yang terhubung ke akun tersebut saat ingin menghubungkannya ke akun Discordmu untuk pertama kalinya!",
        incorrectEmail:
            "Maaf, email yang kamu masukkan tidak terhubung ke akun tersebut!",
        newAccountUidBindConfirmation:
            "Apakah kamu ingin menghubungkan akun dengan uid %s?",
        newAccountUsernameBindConfirmation:
            "Apakah kamu ingin menghubungkan akun dengan username %s?",
        newAccountUidBindSuccessful:
            "Berhasil menghubungkan akunmu ke akun osu!droid dengan uid %s. Kamu dapat menghubungkan %s akun osu!droid lagi.",
        newAccountUsernameBindSuccessful:
            "Berhasil menghubungkan akunmu ke akun osu!droid dengan username %s. Kamu dapat menghubungkan %s akun osu!droid lagi.",
        accountUidBindError:
            "Maaf, aku tidak dapat menghubungkan akunmu ke akun osu!droid dengan uid %s: %s.",
        accountUsernameBindError:
            "Maaf, aku tidak dapat menghubungkan akunmu ke akun osu!droid dengan username %s: %s.",
        accountHasBeenBindedError:
            "Maaf, akun osu!droid tersebut telah dihubungkan ke akun Discord lainnya!",
        oldAccountUidBindSuccessful:
            "Berhasil menghubungkan akunmu ke akun osu!droid dengan uid %s.",
        oldAccountUsernameBindSuccessful:
            "Berhasil menghubungkan akunmu ke akun osu!droid dengan username %s.",
    };
}
