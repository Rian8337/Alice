import { Translation } from "@alice-localization/base/Translation";
import { VoteStrings } from "../VoteLocalization";

/**
 * The Indonesian translation for the `vote` command.
 */
export class VoteIDTranslation extends Translation<VoteStrings> {
    override readonly translations: VoteStrings = {
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
    };
}
