import { Translation } from "@alice-localization/base/Translation";
import { OnboardingShowRecentPlaysStrings } from "../OnboardingShowRecentPlaysLocalization";

/**
 * The Korean translation for the `onboardingShowRecentPlays` button command.
 */
export class OnboardingShowRecentPlaysKRTranslation extends Translation<OnboardingShowRecentPlaysStrings> {
    override readonly translations: OnboardingShowRecentPlaysStrings = {
        userNotBinded: "",
        profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
    };
}
