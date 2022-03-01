import { Translation } from "@alice-localization/base/Translation";
import { TagStrings } from "../TagLocalization";

/**
 * The Korean translation for the `tag` command.
 */
export class TagKRTranslation extends Translation<TagStrings> {
    override readonly translations: TagStrings = {
        nameTooLong: "저기, 이 태그 이름은 너무 길어요!",
        contentTooLong: "저기, 태그의 내용이 너무 길어요!",
        tagExists: "죄송해요, 해당 이름을 가진 태그는 이미 있어요!",
        tagDoesntExist: "죄송해요, 해당 이름을 가진 태그는 존재하지 않네요!",
        tagDoesntHaveContentAndAttachments:
            "죄송해요, 이 태그는 어떤 내용이나 첨부물도 가지고 있지 않네요!",
        tagDoesntHaveAttachments:
            "죄송해요, 이 태그는 어떤 첨부물도 가지고 있지 않네요!",
        tagAttachmentURLInvalid: "저기, 유효한 URL을 입력해 주세요!",
        noTagAttachmentSlot: "죄송해요, 첨부물은 3개까지만 추가할 수 있어요!",
        tagAttachmentTooBig:
            "죄송해요, 첨부물의 용량이 너무 크네요! 8 MB정도의 이미지까지만 첨부할 수 있어요!",
        addTagSuccessful: "성공적으로 태그 %s을(를) 추가했어요.",
        editTagSuccessful: "성공적으로 태그 %s을(를) 수정했어요.",
        attachToTagSuccessful: "성공적으로 태그 %s에 이미지를 추가했어요.",
        deleteTagIndexOutOfBounds:
            "죄송해요, 해당 태그는 %s개의 첨부물만 가지고 있어요!",
        deleteTagSuccessful: "성공적으로 태그 %s을(를) 삭제했어요.",
        deleteTagAttachmentSuccessful:
            "성공적으로 태그 %s의 첨부물을 삭제했어요.",
        transferTagSuccessful: "성공적으로 %s의 태그들을 %s에게 전달했어요.",
        notTagOwner: "죄송해요, 이 태그는 당신 게 아니네요!",
        selfDoesntHaveTags:
            "죄송해요, 당신은 이 서버에서 저장한 태그가 없네요!",
        userDoesntHaveTags:
            "죄송해요, 해당 유저는 이 서버에서 저장한 태그가 없어요!",
        tagInfo: "",
        tagName: "",
        tagAuthor: "",
        tagCreationDate: "",
        tagAttachmentAmount: "",
        tagsForUser: "",
        totalTags: "",
    };
}
