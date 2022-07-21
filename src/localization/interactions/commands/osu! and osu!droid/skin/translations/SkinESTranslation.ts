import { Translation } from "@alice-localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The Spanish translation for the `skin` command.
 */
export class SkinESTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        noSkinSetForUser: "Lo siento, este usuario no tiene ninguna skin!",
        invalidSkinName: "",
        invalidSkinLink: "",
        skinNameNotAvailable: "",
        skinNotFound: "",
        skinNotOwnedByUser: "",
        previewImageTooBig: "",
        invalidPreviewImage: "",
        userSkinList: "",
        addSkinFailed: "",
        addSkinSuccess: "",
        deleteSkinFailed: "",
        deleteSkinSuccess: "",
        editSkinFailed: "",
        editSkinSuccess: "",
    };
}
