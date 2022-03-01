import { Translation } from "@alice-localization/base/Translation";
import { UserBeatmapCalculationStrings } from "../UserBeatmapCalculationLocalization";

/**
 * The Indonesian translation for the `userBeatmapCalculation` event utility in `messageCreate` event.
 */
export class UserBeatmapCalculationIDTranslation extends Translation<UserBeatmapCalculationStrings> {
    override readonly translations: UserBeatmapCalculationStrings = {
        droidStars: "",
        droidPP: "",
        pcStars: "",
        pcPP: "",
        beatmapLimitation: "",
    };
}
