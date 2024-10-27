import { Translation } from "@localization/base/Translation";
import { MapshareStrings } from "../MapshareLocalization";

/**
 * The English translation for the `mapshare` command.
 */
export class MapshareENTranslation extends Translation<MapshareStrings> {
    override readonly translations: MapshareStrings = {
        noSubmissionWithStatus:
            "I'm sorry, there is no submission with %s status now!",
        noBeatmapFound: "Hey, please enter a valid beatmap link or ID!",
        beatmapIsOutdated:
            "I'm sorry, the beatmap was updated after submission! Submission has been automatically deleted.",
        noSubmissionWithBeatmap:
            "I'm sorry, there is no submission with that beatmap!",
        submissionIsNotPending:
            "I'm sorry, this submission is not in pending status!",
        userIsAlreadyBanned:
            "I'm sorry, this user is already banned from submitting a map share submission!",
        userIsNotBanned:
            "I'm sorry, this user is not banned from submitting a map share submission!",
        denyFailed: "I'm sorry, I couldn't deny the submission: %s.",
        denySuccess: "Successfully denied the submission.",
        acceptFailed: "I'm sorry, I couldn't accept the submission: %s.",
        acceptSuccess: "Successfully accepted the submission.",
        banFailed:
            "I'm sorry, I couldn't ban the user from map share submission: %s.",
        banSuccess: "Successfully banned the user from map share submission.",
        unbanFailed:
            "I'm sorry, I couldn't unban the user from map share submission: %s.",
        unbanSuccess:
            "Successfully unbanned the user from map share submission.",
        postFailed: "I'm sorry, I couldn't post the submission: %s.",
        postSuccess: "Successfully posted the submission.",
        statusAccepted: "accepted",
        statusDenied: "denied",
        statusPending: "pending",
        statusPosted: "posted",
        submissionStatusList: "Submissions with %s status",
        submissionFromUser: "Submission from %s",
        userId: "User ID",
        beatmapId: "Beatmap ID",
        beatmapLink: "Beatmap Link",
        creationDate: "Creation Date",
        submitModalTitle: "Map Share Submission",
        submitModalBeatmapLabel: "Beatmap ID or Link",
        submitModalBeatmapPlaceholder:
            "Enter the beatmap ID or link that you want to submit.",
        submitModalSummaryLabel: "Summary",
        submitModalSummaryPlaceholder:
            "Enter the summary about the beatmap you are sharing.",
    };
}
