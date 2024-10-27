import { Translation } from "@localization/base/Translation";
import { SkinStrings } from "../SkinLocalization";

/**
 * The English translation for the `skin` command.
 */
export class SkinENTranslation extends Translation<SkinStrings> {
    override readonly translations: SkinStrings = {
        invalidSkinName: "Hey, skin names cannot contain unicode characters!",
        invalidSkinLink: "I'm sorry, the link you've entered is invalid!",
        skinNameNotAvailable:
            "I'm sorry, you already have a skin with that name!",
        skinNotFound: "I'm sorry, I couldn't find the skin!",
        skinNotOwnedByUser: "I'm sorry, you don't own this skin!",
        noSkinSetForUser: "I'm sorry, this user doesn't have any skins!",
        previewImageTooBig:
            "I'm sorry, preview images' size must be less than 8 MB!",
        invalidPreviewImage: "I'm sorry, that attachment is invalid!",
        userSkinList: "Skins from %s",
        addSkinFailed: "I'm sorry, I couldn't add the skin: %s.",
        addSkinSuccess: "Successfully added the skin.",
        deleteSkinFailed: "I'm sorry, I couldn't delete the skin: %s.",
        deleteSkinSuccess: "Successfully deleted the skin.",
        editSkinFailed: "I'm sorry, I couldn't edit the skin: %s.",
        editSkinSuccess: "Successfully edited the skin.",
    };
}
