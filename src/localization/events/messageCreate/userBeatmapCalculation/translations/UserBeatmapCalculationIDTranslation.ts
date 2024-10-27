import { Translation } from "@localization/base/Translation";
import { UserBeatmapCalculationStrings } from "../UserBeatmapCalculationLocalization";

/**
 * The Indonesian translation for the `userBeatmapCalculation` event utility in `messageCreate` event.
 */
export class UserBeatmapCalculationIDTranslation extends Translation<UserBeatmapCalculationStrings> {
    override readonly translations: UserBeatmapCalculationStrings = {
        droidStars: "Raw droid star",
        droidPP: "Droid pp",
        pcStars: "Raw PC star",
        pcPP: "PC pp",
        beatmapLimitation:
            "Aku menemukan %s beatmap, tetapi hanya menampilkan 3 karena keterbatasanku.",
    };
}
