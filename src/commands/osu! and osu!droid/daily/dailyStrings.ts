/**
 * Strings for the `daily` command.
 */
export enum dailyStrings {
    tooManyOptions = "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
    noAvailablePlayers = "I'm sorry, there are no players as of now!",
    noOngoingChallenge = "I'm sorry, there is no ongoing challenge now!",
    challengeNotFound = "I'm sorry, I cannot find the challenge!",
    startChallengeFailed = "I'm sorry, I couldn't start the challenge: %s.",
    startChallengeSuccess = "Successfully started challenge `%s`.",
    userHasPlayedChallenge = "The player has played challenge `%s` with highest bonus level achieved `%s`.",
    userHasNotPlayedChallenge = "The player has not played challenge `%s`.",
    scoreNotFound = "I'm sorry, you haven't played the challenge beatmap!",
    challengeNotCompleted = "I'm sorry, you did not complete the ongoing challenge: %s.",
    challengeCompleted = "Congratulations! You have completed challenge `%s` with challenge bonus level `%s`, earning `%s` point`%s` and %s`%s` Alice coins! You now have `%s` point%s and %s`%s` Alice coins.",
    invalidReplayURL = "Hey, please enter a valid URL!",
    replayDownloadFail = "I'm sorry, I couldn't download your replay!",
    replayInvalid = "Hey, please provide the proper download link to your replay!",
    replayDoesntHaveSameUsername = "I'm sorry, that replay file does not contain the same username as your binded osu!droid account!",
    replayTooOld = "I'm sorry, that replay's format version is too old!",
    manualSubmissionConfirmation = "Please ask a staff member to confirm your manual submission!"
};