import { Translation } from "@localization/base/Translation";
import { OnboardingShowMostRecentPlayStrings } from "../OnboardingShowMostRecentPlayLocalization";

/**
 * The Indonesian translation for the `onboardingShowMostRecentPlay` button command.
 */
export class OnboardingShowMostRecentPlayIDTranslation extends Translation<OnboardingShowMostRecentPlayStrings> {
    override readonly translations: OnboardingShowMostRecentPlayStrings = {
        userNotBinded:
            "Maaf, kamu belum menghubungkan akun osu!droid kamu! Silakan merujuk ke petunjuk di atas untuk menghubungkan akunmu.",
        profileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        playerHasNoRecentPlays:
            "Maaf, pemain ini belum pernah mengirimkan skor!",
        recentPlayDisplay: "Skor terbaru dari %s:",
    };
}
