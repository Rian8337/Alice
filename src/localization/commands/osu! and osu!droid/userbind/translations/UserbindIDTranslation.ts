import { Translation } from "@alice-localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Indonesian translation for the `userbind` command.
 */
export class UserbindIDTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound:
            "Maaf, aku tidak dapat menemukan profil akun tersebut!",
        verificationMapNotFound:
            "Maaf, akun ini belum pernah memainkan beatmap verifikasi! Mohon gunakan perintah `/userbind verifymap` untuk mendapatkan beatmap verifikasi.",
        newAccountBindNotInMainServer:
            "Maaf, menghubungkan akun baru harus dilakukan di server Discord osu!droid International! Ini dibutuhkan untuk mempermudah pengawasan.",
        newAccountBindNotVerified:
            "Maaf, kamu harus memverifikasi diri sendiri terlebih dahulu untuk menggunakan perintah ini!",
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
        verificationMapInformation:
            "Gunakan beatmap ini untuk memverifikasi bahwa kamu adalah pemilik suatu akun osu!droid. Ini dibutuhkan apabila kamu ingin menghubungkan akun tersebut untuk pertama kalinya.",
    };
}
