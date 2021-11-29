/**
 * Strings for the `whitelist` command.
 */
export enum whitelistStrings {
    noBeatmapProvided = "Hey, please enter a beatmap link or beatmap ID!",
    noBeatmapIDorSetIDFound = "I'm sorry, I cannot find any beatmap ID or beatmapset ID!",
    noBeatmapsFound = "I'm sorry, I cannot find any beatmap with the provided beatmap ID or link!",
    whitelistSuccess = "Successfully whitelisted `%s`.",
    whitelistFailed = "I'm sorry, I'm unable to whitelist `%s`: `%s`.",
    unwhitelistSuccess = "Successfully unwhitelisted `%s`.",
    unwhitelistFailed = "I'm sorry, I'm unable to unwhitelist `%s`: `%s`.",
    noCachedBeatmapFound = "I'm sorry, there is no cached beatmap in this channel! Please enter a beatmap ID or beatmap link!",
    beatmapNotFound = "I'm sorry, I cannot find the beatmap in osu! beatmap listing!",
    beatmapDoesntNeedWhitelist = "Hey, this beatmap doesn't need to be whitelisted!",
    whitelistStatus = "`%s` is %s."
}