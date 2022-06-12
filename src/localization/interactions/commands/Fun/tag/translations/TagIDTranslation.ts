import { Translation } from "@alice-localization/base/Translation";
import { TagStrings } from "../TagLocalization";

/**
 * The Indonesian translation for the `tag` command.
 */
export class TagIDTranslation extends Translation<TagStrings> {
    override readonly translations: TagStrings = {
        nameTooLong: "",
        contentTooLong: "",
        tagExists: "",
        tagDoesntExist: "",
        tagDoesntHaveContentAndAttachments: "",
        tagDoesntHaveAttachments: "",
        tagAttachmentURLInvalid: "",
        noTagAttachmentSlot: "",
        tagAttachmentTooBig: "",
        addTagSuccessful: "",
        editTagSuccessful: "",
        attachToTagSuccessful: "",
        deleteTagIndexOutOfBounds: "",
        deleteTagSuccessful: "",
        deleteTagAttachmentSuccessful: "",
        transferTagSuccessful: "",
        notTagOwner: "",
        selfDoesntHaveTags: "",
        userDoesntHaveTags: "",
        tagInfo: "",
        tagName: "",
        tagAuthor: "",
        tagCreationDate: "",
        tagAttachmentAmount: "",
        tagsForUser: "",
        totalTags: "",
    };
}
