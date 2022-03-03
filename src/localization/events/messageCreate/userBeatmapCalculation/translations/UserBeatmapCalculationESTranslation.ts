import { Translation } from "@alice-localization/base/Translation";
import { UserBeatmapCalculationStrings } from "../UserBeatmapCalculationLocalization";

/**
 * The Spanish translation for the `userBeatmapCalculation` event utility in `messageCreate` event.
 */
export class UserBeatmapCalculationESTranslation extends Translation<UserBeatmapCalculationStrings> {
    override readonly translations: UserBeatmapCalculationStrings = {
        droidStars: "Raw droid stars",
        droidPP: "Raw droid pp",
        pcStars: "Raw PC stars",
        pcPP: "Raw PC pp",
        beatmapLimitation:
            "Encontré %s mapas, pero solo puedo mostrar 3 debido a ciertas limitaciones.",
    };
}
