import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface SkinStrings {
    readonly skinSet: string;
    readonly noSkinSetForUser: string;
    readonly userSkinInfo: string;
    readonly tsukushiSite: string;
}

/**
 * Localizations for the `skin` command.
 */
export class SkinLocalization extends Localization<SkinStrings> {
    protected override readonly translations: Readonly<Translation<SkinStrings>> = {
        en: {
            skinSet: "%s, successfully set your skin to <%s>.",
            noSkinSetForUser: "I'm sorry, this user doesn't have any skins!",
            userSkinInfo: "%s's skin: %s",
            tsukushiSite: "For a collection of skins, visit https://tsukushi.site",
        }
    };
}