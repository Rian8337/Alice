import { Translation } from "@localization/base/Translation";
import { CompareScoreStrings } from "../CompareScoreLocalization";

/**
 * The Indonesian translation for the `compareScore` context menu command.
 */
export class CompareScoreIDTranslation extends Translation<CompareScoreStrings> {
    override readonly translations: CompareScoreStrings = {
        beatmapNotFound:
            "Maaf, aku tidak dapat menemukan beatmap yang kamu berikan!",
        profileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        scoreNotFound: "Maaf, kamu belum pernah memainkan beatmap ini!",
        comparePlayDisplay: "Skor perbandingan untuk %s:",
    };
}
