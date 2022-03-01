import { Translation } from "@alice-localization/base/Translation";
import { MessageButtonCreatorStrings } from "../MessageButtonCreatorLocalization";

/**
 * The Korean translation for the `MessageButtonCreator` creator utility.
 */
export class MessageButtonCreatorKRTranslation extends Translation<MessageButtonCreatorStrings> {
    override readonly translations: MessageButtonCreatorStrings = {
        pleaseWait: "잠시 기다려주세요...",
        actionCancelled: "행동이 취소됐어요.",
        timedOut: "시간이 초과됐어요.",
    };
}
