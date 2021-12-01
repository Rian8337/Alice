/**
 * Strings for the `blacklist` command.
 */
export enum blacklistStrings {
    noBeatmapProvided = "Hey, please enter a beatmap to blacklist or unblacklist!",
    beatmapNotFound = "Hey, I cannot find the beatmap with the provided link or ID!",
    noBlacklistReasonProvided = "Hey, please enter a reason for blacklisting the beatmap!",
    blacklistFailed = "I'm sorry, I cannot blacklist the beatmap: `%s`.",
    blacklistSuccess = "Successfully blacklisted `%s`.",
    unblacklistFailed = "I'm sorry, I cannot unblacklist the beatmap: `%s`.",
    unblacklistSuccess = "Successfully unblacklisted `%s`.",
}
