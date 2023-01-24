import { Translation } from "@alice-localization/base/Translation";
import { ShowRecentPlaysStrings } from "../ShowRecentPlaysLocalization";

/**
 * The Indonesian translation for the `showRecentPlays` button command.
 */
export class ShowRecentPlaysIDTranslation extends Translation<ShowRecentPlaysStrings> {
    override readonly translations: ShowRecentPlaysStrings = {
        userNotBinded:
            "Maaf, kamu belum menghubungkan akun osu!droid kamu! Silakan merujuk ke petunjuk di atas untuk menghubungkan akunmu.",
        profileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
    };
}
