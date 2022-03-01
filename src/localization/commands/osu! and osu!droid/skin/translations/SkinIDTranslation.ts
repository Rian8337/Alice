import { Translation } from "@alice-localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The Indonesian translation for the `skin` command.
 */
export class SkinIDTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        skinSet: "",
        noSkinSetForUser: "",
        userSkinInfo: "",
        tsukushiSite: "",
    };
}
