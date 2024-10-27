import { Translation } from "@localization/base/Translation";
import { hideLinkEmbed, hyperlink } from "discord.js";
import { ViewDroidProfileStrings } from "../ViewDroidProfileLocalization";

/**
 * The Spanish translation for the `viewDroidProfile` user context menu command.
 */
export class ViewDroidProfileESTranslation extends Translation<ViewDroidProfileStrings> {
    override readonly translations: ViewDroidProfileStrings = {
        selfProfileNotFound: "Lo siento, no puede encontrar tu perfil!",
        userProfileNotFound:
            "Lo siento, no puede encontrar el perfil de ese jugador!",
        viewingProfile: `Perfil de osu!droid de ${hyperlink(
            "%s",
            hideLinkEmbed("%s"),
        )}:`,
    };
}
