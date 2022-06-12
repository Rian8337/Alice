import { Translation } from "@alice-localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The English translation for the `skin` command.
 */
export class SkinENTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        skinSet: "%s, successfully set your skin to <%s>.",
        noSkinSetForUser: "I'm sorry, this user doesn't have any skins!",
        userSkinInfo: "%s's skin: %s",
        tsukushiSite: "For a collection of skins, visit https://tsukushi.site",
    };
}
