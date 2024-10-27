import { Translation } from "@localization/base/Translation";
import { VoteStrings } from "../VoteLocalization";

/**
 * The Korean translation for the `vote` command.
 */
export class VoteKRTranslation extends Translation<VoteStrings> {
    override readonly translations: VoteStrings = {
        ongoingVoteInChannel:
            "죄송해요, 이 채널에서 이미 진행중인 투표가 있어요!",
        noOngoingVoteInChannel: "죄송해요, 이 채널에서 진행중인 투표가 없어요!",
        noEndVotePermission:
            "죄송해요, 진행중인 투표를 종료할 수 없어요! 해당 투표의 시작자거나 이 채널에서의 `채널 관리` 권한이 있어야 해요!",
        endVoteSuccess: "투표가 종료됐어요!",
        voteChoiceIsSameAsBefore: "죄송해요, 그 선택지에 이미 투표했어요!",
        notVotedYet: "죄송해요, 어느 선택지에도 투표하지 않으셨어요!",
        invalidVoteChoice: "저기, 유효한 투표 선택지를 입력해 주세요!",
        voteRegistered: "%s, 당신의 투표가 성공적으로 입력됐어요!",
        voteCancelled: "%s, 당신이 한 투표가 성공적으로 취소됐어요!",
        voteMoved: "%s, 당신의 투표가 %s에서 %s로 변경되었어요!",
        tooFewChoices: "죄송해요, 최소 2가지 선택지는 지정해야만 해요!",
        voteStartSuccess: "성공적으로 투표를 시작했어요.",
        invalidXpReq: "저기, 유효한 Tatsu XP 요구 수치를 입력해주세요!",
        cannotRetrieveTatsuXP:
            "죄송해요, 당신의 Tatsu XP 수치를 가져올 수 없었어요!",
        tatsuXPTooSmall:
            "죄송해요, 이 투표에 참여하기 위한 Tatsu XP가 부족해요!",
        topic: "주제",
    };
}
