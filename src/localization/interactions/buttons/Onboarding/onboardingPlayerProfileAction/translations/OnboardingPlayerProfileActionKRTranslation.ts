import { Translation } from "@alice-localization/base/Translation";
import { OnboardingPlayerProfileActionStrings } from "../OnboardingPlayerProfileActionLocalization";

/**
 * The Korean translation for the `onboardingPlayerProfileAction` button command.
 */
export class OnboardingPlayerProfileActionKRTranslation extends Translation<OnboardingPlayerProfileActionStrings> {
    override readonly translations: OnboardingPlayerProfileActionStrings = {
        userNotBinded: "",
        profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        viewingProfile: "[%s](<%s>)의 osu!droid 프로필:",
    };
}
