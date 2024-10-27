import { Translation } from "@localization/base/Translation";
import { VoteStrings } from "../VoteLocalization";

/**
 * The English translation for the `vote` command.
 */
export class VoteENTranslation extends Translation<VoteStrings> {
    override readonly translations: VoteStrings = {
        ongoingVoteInChannel:
            "I'm sorry, there is an ongoing vote in this channel!",
        noOngoingVoteInChannel:
            "I'm sorry, there is no ongoing vote in this channel!",
        noEndVotePermission:
            "I'm sorry, you cannot end the ongoing vote! You must be the initiator of it or have the `Manage Channels` permission in the channel!",
        endVoteSuccess: "Vote ended!",
        voteChoiceIsSameAsBefore: "I'm sorry, you have voted for that choice!",
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
    };
}
