import { Translation } from "@localization/base/Translation";
import { hyperlink, hideLinkEmbed } from "discord.js";
import { OnboardingPlayerProfileActionStrings } from "../OnboardingPlayerProfileActionLocalization";

/**
 * The Indonesian translation for the `onboardingPlayerProfileAction` button command.
 */
export class OnboardingPlayerProfileActionIDTranslation extends Translation<OnboardingPlayerProfileActionStrings> {
    override readonly translations: OnboardingPlayerProfileActionStrings = {
        userNotBinded: "",
        profileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        viewingProfile: `Profil osu!droid untuk ${hyperlink(
            "%s",
            hideLinkEmbed("%s"),
        )}:`,
    };
}
