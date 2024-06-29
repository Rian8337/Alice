import { Translation } from "@alice-localization/base/Translation";
import { FancyStrings } from "../FancyLocalization";

/**
 * The Korean translation for the `fancy` command.
 */
export class FancyKRTranslation extends Translation<FancyStrings> {
    override readonly translations: FancyStrings = {
        durationError: "저기, 유저를 잠금할 유효한 기간을 입력 해 주세요!",
        cannotRetrieveTatsuXP: "",
        tatsuXPRequirementNotMet: "",
        applicationMessageEmbedTitle: "",
        applicationMessageEmbedDescription: "",
        applicationMessageInitiateVote: "",
        applicationMessageRejectApplication: "",
        applicationFailed: "",
        applicationSent: "",
        lockProcessFailed: "죄송해요, 유저 %s 를 잠금할 수 없어요.",
        unlockProcessFailed: "죄송해요, 유저 %s 를 잠금 해제할 수 없어요.",
        lockProcessSuccessful: "성공적으로 유저를 잠궜어요.",
        unlockProcessSuccessful: "성공적으로 유저를 잠금 해제했어요.",
    };
}
