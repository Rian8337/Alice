import { Translation } from "@alice-localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The Spanish translation for the `skin` command.
 */
export class SkinESTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        skinSet: "%s, colocaste correctamente <%s> como tu skin.",
        noSkinSetForUser: "Lo siento, este usuario no tiene ninguna skin!",
        userSkinInfo: "Skin de %s : %s",
        tsukushiSite:
            "Para ver una colección de skins, visita https://tsukushi.site",
    };
}
