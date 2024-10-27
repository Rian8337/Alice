import { Translation } from "@localization/base/Translation";
import { CompareStrings } from "../CompareLocalization";

/**
 * The Indonesian translation for the `compare` command.
 */
export class CompareIDTranslation extends Translation<CompareStrings> {
    override readonly translations: CompareStrings = {
        tooManyOptions:
            "Maaf, kamu hanya dapat memasukkan uid, pengguna, atau username! Kamu tidak dapat menggabung mereka!",
        noCachedBeatmap:
            "Maaf, tidak ada beatmap yang sedang diobrolkan dalam channel ini!",
        playerNotFound:
            "Maaf, aku tidak dapat menemukan pemain yang kamu berikan!",
        selfScoreNotFound: "Maaf, kamu belum pernah memainkan beatmap ini!",
        userScoreNotFound:
            "Maaf, pemain tersebut belum pernah memainkan beatmap ini!",
        comparePlayDisplay: "Skor perbandingan untuk %s:",
    };
}
