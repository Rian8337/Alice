import { Translation } from "@alice-localization/base/Translation";
import { OnboardingShowRecentPlaysStrings } from "../OnboardingShowRecentPlaysLocalization";

/**
 * The Indonesian translation for the `onboardingShowRecentPlays` button command.
 */
export class OnboardingShowRecentPlaysIDTranslation extends Translation<OnboardingShowRecentPlaysStrings> {
    override readonly translations: OnboardingShowRecentPlaysStrings = {
        userNotBinded:
            "Maaf, kamu belum menghubungkan akun osu!droid kamu! Silakan merujuk ke petunjuk di atas untuk menghubungkan akunmu.",
        profileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
    };
}
