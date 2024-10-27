import { Translation } from "@localization/base/Translation";
import { UserBeatmapCalculationStrings } from "../UserBeatmapCalculationLocalization";

/**
 * The Korean translation for the `userBeatmapCalculation` event utility in `messageCreate` event.
 */
export class UserBeatmapCalculationKRTranslation extends Translation<UserBeatmapCalculationStrings> {
    override readonly translations: UserBeatmapCalculationStrings = {
        droidStars: "Raw droid stars",
        droidPP: "Raw droid pp",
        pcStars: "Raw PC stars",
        pcPP: "Raw PC pp",
        beatmapLimitation:
            "%s개의 맵을 찾았지만, 제 한계로 인해 3개만 보여드려요.",
    };
}
