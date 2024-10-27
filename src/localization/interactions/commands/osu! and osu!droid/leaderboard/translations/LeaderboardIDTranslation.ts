import { Translation } from "@localization/base/Translation";
import { LeaderboardStrings } from "../LeaderboardLocalization";

/**
 * The Indonesian translation for the `leaderboard` command.
 */
export class LeaderboardIDTranslation extends Translation<LeaderboardStrings> {
    override readonly translations: LeaderboardStrings = {
        invalidPage: "Hei, mohon berikan halaman yang benar!",
        dppLeaderboardClanNotFound:
            "Maaf, aku tidak dapat menemukan klan tersebut!",
        noPrototypeEntriesFound:
            "Maaf, tidak ada skor prototipe yang tersedia untuk sekarang!",
        noBeatmapFound: "Hei, mohon berikan tautan atau ID beatmap yang benar!",
        username: "Username",
        uid: "UID",
        playCount: "Jumlah Main",
        pp: "PP",
        accuracy: "Akurasi",
        score: "Skor",
    };
}
