import { Translation } from "@alice-localization/base/Translation";
import { FancyApplicationStrings } from "../FancyApplicationLocalization";
import { bold } from "discord.js";

/**
 * The English translation for the `FancyApplication` database utility.
 */
export class FancyApplicationENTranslation extends Translation<FancyApplicationStrings> {
    override readonly translations: FancyApplicationStrings = {
        voteNotStarted: "vote has not started",
        voteHasFinished: "vote has finished",
        channelNotFound: "channel not found",
        applicationNotCancellable: "application not cancellable at this stage",
        applicationNotRejectable: "application not rejectable at this stage",
        userApplicationRejected:
            "Hello, I would like to inform that your application has been rejected. You may apply again in %s (%s).",
        applicationEmbedTitle: "Fancy Lounge Application",
        applicationEmbedDescriptionStatus: `${bold("Status")}: %s`,
        applicationEmbedDescriptionReason: `${bold("Reason")}: %s`,
        applicationStatusPendingApproval: "Pending Vote Approval",
        applicationStatusInVote: "In Vote",
        applicationStatusInReview: "In Review",
        applicationStatusCancelled: "Cancelled",
        applicationStatusRejected: "Rejected",
        applicationStatusAccepted: "Accepted",
        disagreeVotesExists:
            "The lounge application for %s has disagreements. Please review them before proceeding.",
    };
}
