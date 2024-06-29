import { Translation } from "@alice-localization/base/Translation";
import { RegisterFancyVoteStrings } from "../RegisterFancyVoteLocalization";

/**
 * The English translation for the `registerFancyVote` button command.
 */
export class RegisterFancyVoteENTranslation extends Translation<RegisterFancyVoteStrings> {
    override readonly translations: RegisterFancyVoteStrings = {
        voteNotFound: "I'm sorry, I'm unable to find the vote of this user!",
        submitReasonModalTitle: "Vote Reason",
        submitReasonModalLabel: "Reason",
        submitReasonModalPlaceholder:
            'Enter your reason for voting "No" on this user.',
        voteRegistrationFailed:
            "I'm sorry, I'm unable to register your vote: %s.",
        voteRegistrationSuccess: "Your vote has been successfully registered!",
    };
}
