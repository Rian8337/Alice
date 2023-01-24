import { Translation } from "@alice-localization/base/Translation";
import { RecentStrings } from "../RecentLocalization";

/**
 * The Indonesian translation for the `recent` command.
 */
export class RecentIDTranslation extends Translation<RecentStrings> {
    override readonly translations: RecentStrings = {
        tooManyOptions:
            "Maaf, kamu hanya dapat memasukkan uid, pengguna, atau username! Kamu tidak dapat menggabung mereka!",
        playerNotFound:
            "Maaf, aku tidak dapat menemukan pemain yang kamu berikan!",
        playerHasNoRecentPlays:
            "Maaf, pemain ini belum pernah mengirimkan skor!",
        playIndexOutOfBounds:
            "Maaf, pemain ini tidak memiliki skor terbaru ke-%s!",
        recentPlayDisplay: "Skor terbaru dari %s:",
    };
}
