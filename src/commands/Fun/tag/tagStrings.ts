/**
 * Strings for the `tags` command.
 */
export enum tagStrings {
    nameTooLong = "Hey, that tag's name is too long!",
    contentTooLong = "Hey, that tag's content is too long!",
    tagExists = "I'm sorry, a tag with that name exists!",
    tagDoesntExist = "I'm sorry, a tag with that name doesn't exist!",
    tagDoesntHaveContentAndAttachments = "I'm sorry, this tag doesn't have any content nor does it have any attachments!",
    tagDoesntHaveAttachments = "I'm sorry, this tag doesn't have any attachments!",
    tagAttachmentURLInvalid = "Hey, please enter a valid URL!",
    noTagAttachmentSlot = "I'm sorry, you can only attach up to 3 attachments!",
    tagAttachmentTooBig = "I'm sorry, the size of your attachment is too big! You can only attach an image with size at most 8 MB!",
    addTagSuccessful = "Successfully added tag `%s`.",
    editTagSuccessful = "Successfully edited tag `%s`.",
    attachToTagSuccessful = "Successfully attached an image to tag `%s`.",
    deleteTagIndexOutOfBounds = "I'm sorry, the tag only has %s attachment(s)!",
    deleteTagSuccessful = "Successfully deleted tag `%s`.",
    deleteTagAttachmentSuccessful = "Successfully deleted the attachment of tag `%s`.",
    transferTagSuccessful = "Successfully transferred %s's tags to %s.",
    notTagOwner = "I'm sorry, this tag doesn't belong to you!",
    userDoesntHaveTags = "I'm sorry, %s have any saved tags in this server!",
}
