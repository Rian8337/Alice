import { Translation } from "@alice-localization/base/Translation";
import { OnboardingNavigationRowCreatorStrings } from "../OnboardingNavigationRowCreatorLocalization";

/**
 * The English translation for the `OnboardingNavigationRowCreator` utility.
 */
export class OnboardingNavigationRowCreatorENTranslation extends Translation<OnboardingNavigationRowCreatorStrings> {
    override readonly translations: OnboardingNavigationRowCreatorStrings = {
        home: "Home",
        bindAccount: "Bind osu!droid account",
        playerProfile: "Show player profile",
        recentPlays: "Show recent play(s)",
        scoreComparison: "Compare scores",
        droidPerformancePoints: "Droid performance points (dpp)",
    };
}
