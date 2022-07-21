import { Translation } from "@alice-localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The Indonesian translation for the `skin` command.
 */
export class SkinIDTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        noSkinSetForUser: "",
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
