import { Translation } from "@localization/base/Translation";
import { hyperlink, hideLinkEmbed } from "discord.js";
import { OnboardingPlayerProfileActionStrings } from "../OnboardingPlayerProfileActionLocalization";

/**
 * The Spanish translation for the `onboardingPlayerProfileAction` button command.
 */
export class OnboardingPlayerProfileActionESTranslation extends Translation<OnboardingPlayerProfileActionStrings> {
    override readonly translations: OnboardingPlayerProfileActionStrings = {
        userNotBinded: "",
        profileNotFound: "Lo siento, no puede encontrar tu perfil!",
        viewingProfile: `Perfil de osu!droid de ${hyperlink(
            "%s",
            hideLinkEmbed("%s"),
        )}:`,
    };
}
