/**
 * Strings for the `profile` command.
 */
export enum profileStrings {
    tooManyOptions = "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
    profileNotFound = "I'm sorry, I cannot find %s profile!",
    viewingProfile = "osu!droid profile for %s:\n<%s>",
    infoBoxColorInfo = "Your information box %s is `%s`.",
    invalidRGBAformat = "I'm sorry, that's an invalid RGBA color format!",
    invalidHexCode = "I'm sorry, that's an invalid hex code!",
    changeInfoBoxColorConfirmation = "%s, are you sure you want to change your profile picture description box %s color to `%s`?",
    changeInfoBoxColorSuccess = "%s, successfully changed your profile picture description box color to `%s`.",
    coinsToBuyBackgroundNotEnough = "I'm sorry, you don't have enough %sAlice coins to perform this action! A background costs %s`500` Alice coins. You currently have %s`%s` Alice coins.",
    buyBackgroundConfirmation = "%s, you don't have this background yet! Are you sure you want to purchase this background for %s`500` Alice coins and change your background profile picture to the background?",
    switchBackgroundConfirmation = "%s, are you sure you want to change your background profile picture?",
    switchBackgroundSuccess = "%s, successfully set your background profile picture to `%s`.%s",
    userDoesntOwnAnyBadge = "I'm sorry, you don't own any badges!",
    badgeIsAlreadyClaimed = "I'm sorry, you've already owned this badge!",
    equipBadgeSuccess = "%s, successfully equipped badge `%s` at slot %s.",
    unequipBadgeSuccess = "%s, successfully unequipped badge at slot %s.",
    badgeUnclaimable = "I'm sorry, this badge cannot be claimed!",
    beatmapToClaimBadgeNotValid = "Hey, please enter a valid beatmap ID or link!",
    beatmapToClaimBadgeNotFound = "I'm sorry, I cannot find the beatmap that you have specified!",
    beatmapToClaimBadgeNotRankedOrApproved = "I'm sorry, only ranked or approved beatmaps count!",
    userDoesntHaveScoreinBeatmap = "I'm sorry, you don't have a score in the beatmap!",
    userCannotClaimBadge = "I'm sorry, you do not fulfill the requirement to get the badge!",
    claimBadgeSuccess = "%s, successfully claimed badge `%s`."
}