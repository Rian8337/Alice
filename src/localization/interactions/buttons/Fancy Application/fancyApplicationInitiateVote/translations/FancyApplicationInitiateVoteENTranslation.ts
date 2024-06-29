import { Translation } from "@alice-localization/base/Translation";
import { FancyApplicationInitiateVoteStrings } from "../FancyApplicationInitiateVoteLocalization";

export class FancyApplicationInitiateVoteENTranslation extends Translation<FancyApplicationInitiateVoteStrings> {
    override readonly translations: FancyApplicationInitiateVoteStrings = {
        userNotification:
            "Hello, your application has been reviewed and has moved to the voting phase!",
        applicationNotPending: "I'm sorry, this application is not pending!",
        voteEmbedTitle: "Lounge Vote",
        voteEmbedDescription: "Applicant: %s\n\nEnds at %s (%s)",
        fancyVoteYes: "Yes",
        fancyVoteNo: "No",
        voteCreationFailed: "I'm sorry, I'm unable to create a vote: %s.",
        voteCreationSuccess: "Successfully created a vote.",
    };
}
