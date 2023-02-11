import { Translation } from "@alice-localization/base/Translation";
import { hideLinkEmbed, hyperlink } from "discord.js";
import { OnboardingPlayerProfileActionStrings } from "../OnboardingPlayerProfileActionLocalization";

/**
 * The English translation for the `onboardingPlayerProfileAction` button command.
 */
export class OnboardingPlayerProfileActionENTranslation extends Translation<OnboardingPlayerProfileActionStrings> {
    override readonly translations: OnboardingPlayerProfileActionStrings = {
        userNotBinded:
            "I'm sorry, you have not binded an osu!droid account! Please follow the procedure outlined above to bind your osu!droid account.",
        profileNotFound: "I'm sorry, I cannot find your profile!",
        viewingProfile: `osu!droid profile for ${hyperlink(
            "%s",
            hideLinkEmbed("%s")
        )}:`,
    };
}
