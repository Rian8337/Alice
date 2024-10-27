import { Translation } from "@localization/base/Translation";
import { RecalcStrings } from "../RecalcLocalization";

/**
 * The Korean translation for the `recalc` command.
 */
export class RecalcKRTranslation extends Translation<RecalcStrings> {
    override readonly translations: RecalcStrings = {
        tooManyOptions:
            "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
        reworkNameMissing: "",
        reworkTypeNotCurrent: "",
        reworkTypeDoesntExist: "",
        userIsDPPBanned: "죄송해요, 이 유저는 DPP-밴당했어요!",
        userHasRequestedRecalc:
            "죄송해요, 이 유저는 이미 이전에 재계산을 신청했어요!",
        userQueued: "성공적으로 %s를 재계산 대기목록에 넣었어요.",
        fullRecalcInProgress: "성공적으로 재계산을 시작했어요.",
        fullRecalcTrackProgress: "재계산 진행중 (%s/%s (%s%))...",
        fullRecalcSuccess: "%s, 재계산이 완료됐어요!",
    };
}
