import { Translation } from "@localization/base/Translation";
import { UserBeatmapCalculationStrings } from "../UserBeatmapCalculationLocalization";

/**
 * The English translation for the `userBeatmapCalculation` event utility in `messageCreate` event.
 */
export class UserBeatmapCalculationENTranslation extends Translation<UserBeatmapCalculationStrings> {
    override readonly translations: UserBeatmapCalculationStrings = {
        droidStars: "Raw droid stars",
        droidPP: "Raw droid pp",
        pcStars: "Raw PC stars",
        pcPP: "Raw PC pp",
        beatmapLimitation:
            "I found %s maps, but only displaying up to 3 due to my limitations.",
    };
}
