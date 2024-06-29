import { Translation } from "@alice-localization/base/Translation";
import { FancyStrings } from "../FancyLocalization";

/**
 * The English translation for the `fancy` command.
 */
export class FancyENTranslation extends Translation<FancyStrings> {
    override readonly translations: FancyStrings = {
        durationError: "Hey, please enter a valid duration!",
        activeApplicationNotFound:
            "I'm sorry, you do not have any active applications!",
        cannotRetrieveTatsuXP:
            "I'm sorry, I'm unable to retrieve your Tatsu XP!",
        tatsuXPRequirementNotMet:
            "I'm sorry, you need at least 100,000 Tatsu XP to apply for the role!",
        applicationMessageEmbedTitle: "Lounge Application",
        applicationMessageEmbedDescription:
            "%s is applying for the lounge role. Please double check their punishment history.",
        applicationMessageInitiateVote: "Start Vote",
        applicationMessageRejectApplication: "Reject Application",
        applicationFailed: "I'm sorry, I'm unable to send the application: %s.",
        applicationSent:
            "Your application has been sent successfully. Please allow staff members to review your application before it moves to the voting phase. You will be informed in DM when a decision has been made.",
        applicationCancelFailed:
            "I'm sorry, I could not cancel your application: %s.",
        applicationCancelSuccess:
            "Successfully cancelled your application. You may apply again in %s (%s).",
        lockProcessFailed: "I'm sorry, I'm unable to lock the user: %s.",
        unlockProcessFailed: "I'm sorry, I'm unable to unlock the user: %s.",
        lockProcessSuccessful: "Successfully locked the user.",
        unlockProcessSuccessful: "Successfully unlocked the user.",
    };
}
