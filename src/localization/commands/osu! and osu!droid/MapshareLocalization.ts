import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MapshareStrings {
    readonly noSubmissionWithStatus: string;
    readonly noBeatmapFound: string;
    readonly noSubmissionWithBeatmap: string;
    readonly submissionIsNotPending: string;
    readonly userIsAlreadyBanned: string;
    readonly userIsNotBanned: string;
    readonly beatmapIsOutdated: string;
    readonly beatmapIsTooEasy: string;
    readonly beatmapHasLessThan50Objects: string;
    readonly beatmapHasNoCirclesOrSliders: string;
    readonly beatmapDurationIsLessThan30Secs: string;
    readonly beatmapIsWIPOrQualified: string;
    readonly beatmapWasJustSubmitted: string;
    readonly beatmapWasJustUpdated: string;
    readonly beatmapHasBeenUsed: string;
    readonly summaryWordCountNotValid: string;
    readonly summaryCharacterCountNotValid: string;
    readonly denyFailed: string;
    readonly denySuccess: string;
    readonly acceptFailed: string;
    readonly acceptSuccess: string;
    readonly banFailed: string;
    readonly banSuccess: string;
    readonly unbanFailed: string;
    readonly unbanSuccess: string;
    readonly postFailed: string;
    readonly postSuccess: string;
    readonly submitFailed: string;
    readonly submitSuccess: string;
    readonly statusAccepted: string;
    readonly statusDenied: string;
    readonly statusPending: string;
    readonly statusPosted: string;
    readonly submissionStatusList: string;
    readonly submissionFromUser: string;
    readonly userId: string;
    readonly beatmapId: string;
    readonly beatmapLink: string;
    readonly creationDate: string;
}

/**
 * Localizations for the `mapshare` command.
 */
export class MapshareLocalization extends Localization<MapshareStrings> {
    protected override readonly translations: Readonly<
        Translation<MapshareStrings>
    > = {
        en: {
            noSubmissionWithStatus:
                "I'm sorry, there is no submission with %s status now!",
            noBeatmapFound: "Hey, please enter a valid beatmap link or ID!",
            noSubmissionWithBeatmap:
                "I'm sorry, there is no submission with that beatmap!",
            submissionIsNotPending:
                "I'm sorry, this submission is not in pending status!",
            userIsAlreadyBanned:
                "I'm sorry, this user is already banned from submitting a map share submission!",
            userIsNotBanned:
                "I'm sorry, this user is not banned from submitting a map share submission!",
            beatmapIsOutdated:
                "I'm sorry, the beatmap was updated after submission! Submission has been automatically deleted.",
            beatmapIsTooEasy:
                "I'm sorry, you can only submit beatmaps that are 3* or higher!",
            beatmapHasLessThan50Objects:
                "I'm sorry, it seems like the beatmap has less than 50 objects!",
            beatmapHasNoCirclesOrSliders:
                "I'm sorry, the beatmap has no circles and sliders!",
            beatmapDurationIsLessThan30Secs:
                "I'm sorry, the beatmap's duration is too short! It must be at least 30 seconds.",
            beatmapIsWIPOrQualified:
                "I'm sorry, you cannot submit a WIP (Work In Progress) and qualified beatmaps!",
            beatmapWasJustSubmitted:
                "I'm sorry, this beatmap was submitted in less than a week ago!",
            beatmapWasJustUpdated:
                "I'm sorry, this beatmap was just updated in less than 3 days ago!",
            beatmapHasBeenUsed:
                "I'm sorry, this beatmap has been submitted as a submission before!",
            summaryWordCountNotValid:
                "I'm sorry, your summary's length is currently %s word(s) long! It must be between 50 and 120 words!",
            summaryCharacterCountNotValid:
                "I'm sorry, your summary's length is currently %s character(s) long! It must be between 100 and 900 words!",
            denyFailed: "I'm sorry, I couldn't deny the submission: %s.",
            denySuccess: "Successfully denied the submission.",
            acceptFailed: "I'm sorry, I couldn't accept the submission: %s.",
            acceptSuccess: "Successfully accepted the submission.",
            banFailed:
                "I'm sorry, I couldn't ban the user from map share submission: %s.",
            banSuccess:
                "Successfully banned the user from map share submission.",
            unbanFailed:
                "I'm sorry, I couldn't unban the user from map share submission: %s.",
            unbanSuccess:
                "Successfully unbanned the user from map share submission.",
            postFailed: "I'm sorry, I couldn't post the submission: %s.",
            postSuccess: "Successfully posted the submission.",
            submitFailed: "I'm sorry, I couldn't submit your submission: %s.",
            submitSuccess: "Successfully submitted your submission.",
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
        },
    };
}
