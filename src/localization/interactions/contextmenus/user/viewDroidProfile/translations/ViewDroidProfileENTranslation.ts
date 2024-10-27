import { Translation } from "@localization/base/Translation";
import { hideLinkEmbed, hyperlink } from "discord.js";
import { ViewDroidProfileStrings } from "../ViewDroidProfileLocalization";

/**
 * The English translation for the `viewDroidProfile` user context menu command.
 */
export class ViewDroidProfileENTranslation extends Translation<ViewDroidProfileStrings> {
    override readonly translations: ViewDroidProfileStrings = {
        selfProfileNotFound: "I'm sorry, I cannot find your profile!",
        userProfileNotFound: "I'm sorry, I cannot find the player's profile!",
        viewingProfile: `osu!droid profile for ${hyperlink(
            "%s",
            hideLinkEmbed("%s"),
        )}:`,
    };
}
