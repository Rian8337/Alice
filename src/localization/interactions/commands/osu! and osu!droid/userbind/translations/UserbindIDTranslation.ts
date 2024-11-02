import { Translation } from "@localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Indonesian translation for the `userbind` command.
 */
export class UserbindIDTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound:
            "Maaf, aku tidak dapat menemukan profil akun tersebut!",
        incorrectEmail:
            "Maaf, email yang kamu masukkan tidak terhubung ke akun tersebut!",
        bindConfirmation: "Apakah kamu ingin menghubungkan akun dengan %s?",
        bindError: "Maaf, aku tidak dapat menghubungkan akunmu ke %s: %s.",
        discordAccountAlreadyBoundError:
            "Maaf, akun Discordmu telah terhubung ke satu akun osu!droid!",
        accountHasBeenBoundError:
            "Maaf, akun osu!droid tersebut telah dihubungkan ke akun Discord lainnya!",
        bindSuccessful: "Berhasil menghubungkan akunmu ke %s.",
    };
}
