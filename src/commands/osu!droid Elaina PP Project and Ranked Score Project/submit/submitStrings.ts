/**
 * Strings for the `submit` command.
 */
export enum submitStrings {
    commandNotAllowed = "I'm sorry, this command is not available in this channel.",
    uidIsBanned = "I'm sorry, your currently binded account has been disallowed from submitting dpp.",
    beatmapNotFound = "Hey, please give me a valid beatmap to submit!",
    beatmapIsBlacklisted = "I'm sorry, this beatmap has been blacklisted.",
    beatmapNotWhitelisted = "I'm sorry, the PP system only accepts ranked, approved, whitelisted, or loved mapset right now!",
    noScoreSubmitted = "I'm sorry, you don't have a score submitted in this beatmap!",
    noScoresInSubmittedList = "I'm sorry, you don't have any scores to submit based on your input!",
    scoreUsesForceAR = "I'm sorry, force AR is not allowed!",
    scoreUsesCustomSpeedMultiplier = "I'm sorry, custom speed multiplier is not allowed!",
    submitSuccessful = "Successfully submitted your play(s). More info in embed.",
    profileNotFound = "I'm sorry, I cannot find your profile!",
    submissionAmountExceedsRecentPlayCount = "I'm sorry, you don't have that many recent plays!"
}