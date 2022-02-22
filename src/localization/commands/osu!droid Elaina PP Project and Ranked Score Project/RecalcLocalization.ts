import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RecalcStrings {
    readonly tooManyOptions: string;
    readonly userIsDPPBanned: string;
    readonly userHasRequestedRecalc: string;
    readonly userQueued: string;
    readonly fullRecalcInProgress: string;
    readonly fullRecalcTrackProgress: string;
    readonly fullRecalcSuccess: string;
}

/**
 * Localizations for the `recalc` command.
 */
export class RecalcLocalization extends Localization<RecalcStrings> {
    protected override readonly translations: Readonly<
        Translation<RecalcStrings>
    > = {
        en: {
            tooManyOptions:
                "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            userIsDPPBanned: "I'm sorry, this user has been DPP banned!",
            userHasRequestedRecalc:
                "I'm sorry, this user has already requested a recalculation before!",
            userQueued: "Successfully queued %s for recalculation.",
            fullRecalcInProgress: "Successfully started recalculation.",
            fullRecalcTrackProgress: "Recalculating players (%s/%s (%s%))...",
            fullRecalcSuccess: "%s, recalculation done!",
        },
        kr: {
            tooManyOptions:
                "죄송해요, uid, 유저, 유저네임 중 하나만 사용할 수 있어요! 이것들을 함께 쓸 수 없어요!",
            userIsDPPBanned: "죄송해요, 이 유저는 DPP-밴당했어요!",
            userHasRequestedRecalc:
                "죄송해요, 이 유저는 이미 이전에 재계산을 신청했어요!",
            userQueued: "성공적으로 %s를 재계산 대기목록에 넣었어요.",
            fullRecalcInProgress: "성공적으로 재계산을 시작했어요.",
            fullRecalcTrackProgress: "재계산 진행중 (%s/%s (%s%))...",
            fullRecalcSuccess: "%s, 재계산이 완료됐어요!",
        },
    };
}
