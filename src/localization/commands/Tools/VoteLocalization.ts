import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface VoteStrings {
    readonly ongoingVoteInChannel: string;
    readonly noOngoingVoteInChannel: string;
    readonly noEndVotePermission: string;
    readonly endVoteSuccess: string;
    readonly voteChoiceIsSameAsBefore: string;
    readonly notVotedYet: string;
    readonly invalidVoteChoice: string;
    readonly voteRegistered: string;
    readonly voteCancelled: string;
    readonly voteMoved: string;
    readonly tooFewChoices: string;
    readonly voteStartSuccess: string;
    readonly invalidXpReq: string;
    readonly cannotRetrieveTatsuXP: string;
    readonly tatsuXPTooSmall: string;
    readonly topic: string;
}

/**
 * Localizations for the `vote` command.
 */
export class VoteLocalization extends Localization<VoteStrings> {
    protected override readonly translations: Readonly<
        Translation<VoteStrings>
    > = {
        en: {
            ongoingVoteInChannel:
                "I'm sorry, there is an ongoing vote in this channel!",
            noOngoingVoteInChannel:
                "I'm sorry, there is no ongoing vote in this channel!",
            noEndVotePermission:
                "I'm sorry, you cannot end the ongoing vote! You must be the initiator of it or have the `Manage Channels` permission in the channel!",
            endVoteSuccess: "Vote ended!",
            voteChoiceIsSameAsBefore:
                "I'm sorry, you have voted for that choice!",
            notVotedYet: "I'm sorry, you have not voted for any option!",
            invalidVoteChoice: "Hey, please enter a valid vote choice!",
            voteRegistered: "%s, your vote has been registered!",
            voteCancelled: "%s, your vote has been cancelled!",
            voteMoved: "%s, your vote has been moved from option %s to %s!",
            tooFewChoices: "I'm sorry, you must specify at least 2 choices!",
            voteStartSuccess: "Successfully started vote.",
            invalidXpReq: "Hey, please enter a valid Tatsu XP requirement!",
            cannotRetrieveTatsuXP:
                "I'm sorry, I'm unable to retrieve your Tatsu XP status!",
            tatsuXPTooSmall:
                "I'm sorry, you don't have enough Tatsu XP to participate in this vote!",
            topic: "Topic",
        },
        kr: {
            ongoingVoteInChannel:
                "죄송해요, 이 채널에서 이미 진행중인 투표가 있어요!",
            noOngoingVoteInChannel:
                "죄송해요, 이 채널에서 진행중인 투표가 없어요!",
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
        },
        id: {
            ongoingVoteInChannel: "",
            noOngoingVoteInChannel: "",
            noEndVotePermission: "",
            endVoteSuccess: "",
            voteChoiceIsSameAsBefore: "",
            notVotedYet: "",
            invalidVoteChoice: "",
            voteRegistered: "",
            voteCancelled: "",
            voteMoved: "",
            tooFewChoices: "",
            voteStartSuccess: "",
            invalidXpReq: "",
            cannotRetrieveTatsuXP: "",
            tatsuXPTooSmall: "",
            topic: "",
        },
    };
}
