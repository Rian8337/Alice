import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface TagStrings {
    readonly nameTooLong: string;
    readonly contentTooLong: string;
    readonly tagExists: string;
    readonly tagDoesntExist: string;
    readonly tagDoesntHaveContentAndAttachments: string;
    readonly tagDoesntHaveAttachments: string;
    readonly tagAttachmentURLInvalid: string;
    readonly noTagAttachmentSlot: string;
    readonly tagAttachmentTooBig: string;
    readonly addTagSuccessful: string;
    readonly editTagSuccessful: string;
    readonly attachToTagSuccessful: string;
    readonly deleteTagIndexOutOfBounds: string;
    readonly deleteTagSuccessful: string;
    readonly deleteTagAttachmentSuccessful: string;
    readonly transferTagSuccessful: string;
    readonly notTagOwner: string;
    readonly selfDoesntHaveTags: string;
    readonly userDoesntHaveTags: string;
    readonly tagInfo: string;
    readonly tagName: string;
    readonly tagAuthor: string;
    readonly tagCreationDate: string;
    readonly tagAttachmentAmount: string;
    readonly tagsForUser: string;
    readonly totalTags: string;
}

/**
 * Localizations for the `tag` command.
 */
export class TagLocalization extends Localization<TagStrings> {
    protected override readonly translations: Readonly<
        Translation<TagStrings>
    > = {
            en: {
                nameTooLong: "Hey, that tag's name is too long!",
                contentTooLong: "Hey, that tag's content is too long!",
                tagExists: "I'm sorry, a tag with that name exists!",
                tagDoesntExist: "I'm sorry, a tag with that name doesn't exist!",
                tagDoesntHaveContentAndAttachments:
                    "I'm sorry, this tag doesn't have any content nor does it have any attachments!",
                tagDoesntHaveAttachments:
                    "I'm sorry, this tag doesn't have any attachments!",
                tagAttachmentURLInvalid: "Hey, please enter a valid URL!",
                noTagAttachmentSlot:
                    "I'm sorry, you can only attach up to 3 attachments!",
                tagAttachmentTooBig:
                    "I'm sorry, the size of your attachment is too big! You can only attach an image with size at most 8 MB!",
                addTagSuccessful: "Successfully added tag `%s`.",
                editTagSuccessful: "Successfully edited tag `%s`.",
                attachToTagSuccessful:
                    "Successfully attached an image to tag `%s`.",
                deleteTagIndexOutOfBounds:
                    "I'm sorry, the tag only has %s attachment(s)!",
                deleteTagSuccessful: "Successfully deleted tag `%s`.",
                deleteTagAttachmentSuccessful:
                    "Successfully deleted the attachment of tag `%s`.",
                transferTagSuccessful: "Successfully transferred %s's tags to %s.",
                notTagOwner: "I'm sorry, this tag doesn't belong to you!",
                selfDoesntHaveTags:
                    "I'm sorry, you don't have any saved tags in this server!",
                userDoesntHaveTags:
                    "I'm sorry, this user doesn't have any saved tags in this server!",
                tagInfo: "Tag Information",
                tagName: "Name",
                tagAuthor: "Author",
                tagCreationDate: "Creation Date",
                tagAttachmentAmount: "Attachments",
                tagsForUser: "Tags for",
                totalTags: "Total tags"
            },
        };
}
