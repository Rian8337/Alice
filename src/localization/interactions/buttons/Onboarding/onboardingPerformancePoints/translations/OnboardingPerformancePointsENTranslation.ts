import { Translation } from "@alice-localization/base/Translation";
import { OnboardingPerformancePointsStrings } from "../OnboardingPerformancePointsLocalization";

/**
 * The English translation for the `onboardingPerformancePoints` button command.
 */
export class OnboardingPerformancePointsENTranslation extends Translation<OnboardingPerformancePointsStrings> {
    override readonly translations: OnboardingPerformancePointsStrings = {
        embedTitle: "Droid Performance Points",
        droidPerformancePointsIntroduction:
            'This feature brings [performance points](https://osu.ppy.sh/wiki/en/Performance_points) to osu!droid with Discord as the medium under the name "droid performance points", which is commonly abbreviated as "dpp".',
        droidPerformancePointsReadMore:
            "Read more about dpp [here](https://osudroidfaq.wordpress.com/elaina-pp-project/), including how to get started with it.",
    };
}
