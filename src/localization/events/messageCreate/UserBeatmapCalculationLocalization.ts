import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface UserBeatmapCalculationStrings {
    readonly droidStars: string;
    readonly droidPP: string;
    readonly pcStars: string;
    readonly pcPP: string;
    readonly beatmapLimitation: string;
}

/**
 * Localizations for the `userBeatmapCalculation` event utility in `messageCreate` event.
 */
export class UserBeatmapCalculationLocalization extends Localization<UserBeatmapCalculationStrings> {
    protected override readonly translations: Readonly<
        Translation<UserBeatmapCalculationStrings>
    > = {
        en: {
            droidStars: "Raw droid stars",
            droidPP: "Raw droid pp",
            pcStars: "Raw PC stars",
            pcPP: "Raw PC pp",
            beatmapLimitation:
                "I found %s maps, but only displaying up to 3 due to my limitations.",
        },
        kr: {
            droidStars: "Raw droid stars",
            droidPP: "Raw droid pp",
            pcStars: "Raw PC stars",
            pcPP: "Raw PC pp",
            beatmapLimitation:
                "%s개의 맵을 찾았지만, 제 한계로 인해 3개만 보여드려요.",
        },
        id: {
            droidStars: "",
            droidPP: "",
            pcStars: "",
            pcPP: "",
            beatmapLimitation: "",
        },
    };
}
