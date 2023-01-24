import { Translation } from "@alice-localization/base/Translation";
import { ShowMostRecentPlayStrings } from "../ShowMostRecentPlayLocalization";

/**
 * The Indonesian translation for the `showMostRecentPlay` button command.
 */
export class ShowMostRecentPlayIDTranslation extends Translation<ShowMostRecentPlayStrings> {
    override readonly translations: ShowMostRecentPlayStrings = {
        userNotBinded:
            "Maaf, kamu belum menghubungkan akun osu!droid kamu! Silakan merujuk ke petunjuk di atas untuk menghubungkan akunmu.",
        profileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        playerHasNoRecentPlays:
            "Maaf, pemain ini belum pernah mengirimkan skor!",
        recentPlayDisplay: "Skor terbaru dari %s:",
    };
}
