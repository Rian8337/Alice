import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { TagENTranslation } from "./translations/TagENTranslation";
import { TagESTranslation } from "./translations/TagESTranslation";
import { TagKRTranslation } from "./translations/TagKRTranslation";

export interface TagStrings {
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
    protected override readonly localizations: Readonly<
        Translations<TagStrings>
    > = {
        en: new TagENTranslation(),
        kr: new TagKRTranslation(),
        es: new TagESTranslation(),
    };
}
