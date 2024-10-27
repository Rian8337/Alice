import { Translation } from "@localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The Korean translation for the `skin` command.
 */
export class SkinKRTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        noSkinSetForUser: "죄송해요, 이 유저는 아무 스킨도 가지고있지 않아요!",
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
