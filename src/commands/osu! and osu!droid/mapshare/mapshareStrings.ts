/**
 * Strings for the `mapshare` command.
 */
export enum mapshareStrings {
    noSubmissionWithStatus = "I'm sorry, there is no submission with %s status now!",
    noBeatmapFound = "Hey, please enter a valid beatmap link or ID!",
    noSubmissionWithBeatmap = "I'm sorry, there is no submission with that beatmap!",
    submissionIsNotPending = "I'm sorry, this submission is not in pending status!",
    userIsAlreadyBanned = "I'm sorry, this user is already banned from submitting a map share submission!",
    userIsNotBanned = "I'm sorry, this user is not banned from submitting a map share submission!",
    beatmapIsOutdated = "I'm sorry, the beatmap was updated after submission! Submission has been automatically deleted.",
    beatmapIsTooEasy = "I'm sorry, you can only submit beatmaps that are 3\* or higher!",
    beatmapHasLessThan50Objects = "I'm sorry, it seems like the beatmap has less than 50 objects!",
    beatmapHasNoCirclesOrSliders = "I'm sorry, the beatmap has no circles and sliders!",
    beatmapDurationIsLessThan30Secs = "I'm sorry, the beatmap's duration is too short! It must be at least 30 seconds.",
    beatmapIsWIPOrQualified = "I'm sorry, you cannot submit a WIP (Work In Progress) and qualified beatmaps!",
    beatmapWasJustSubmitted = "I'm sorry, this beatmap was submitted in less than a week ago!",
    beatmapWasJustUpdated = "I'm sorry, this beatmap was just updated in less than 3 days ago!",
    beatmapHasBeenUsed = "I'm sorry, this beatmap has been submitted as a submission before!",
    summaryWordCountNotValid = "I'm sorry, your summary's length is currently %s word(s) long! It must be between 50 and 120 words!",
    summaryCharacterCountNotValid = "I'm sorry, your summary's length is currently %s character(s) long! It must be between 100 and 900 words!",
    denyFailed = "I'm sorry, I couldn't deny the submission: %s.",
    denySuccess = "Successfully denied the submission.",
    acceptFailed = "I'm sorry, I couldn't accept the submission: %s.",
    acceptSuccess = "Successfully accepted the submission.",
    banFailed = "I'm sorry, I couldn't ban the user from map share submission: %s.",
    banSuccess = "Successfully banned the user from map share submission.",
    unbanFailed = "I'm sorry, I couldn't unban the user from map share submission: %s.",
    unbanSuccess = "Successfully unbanned the user from map share submission.",
    postFailed = "I'm sorry, I couldn't post the submission: %s.",
    postSuccess = "Successfully posted the submission.",
    submitFailed = "I'm sorry, I couldn't submit your submission: %s.",
    submitSuccess = "Successfully submitted your submission."
};