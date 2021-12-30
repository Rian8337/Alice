/**
 * Strings for the `recalc` command.
 */
export enum recalcStrings {
    tooManyOptions = "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
    userIsDPPBanned = "I'm sorry, this user has been DPP banned!",
    userHasRequestedRecalc = "I'm sorry, this user has already requested a recalculation before!",
    userQueued = "Successfully queued %s for recalculation.",
    fullRecalcInProgress = "Successfully started recalculation.",
    fullRecalcTrackProgress = "Recalculating players (%s/%s (%s%))...",
    fullRecalcSuccess = "%s, recalculation done!",
}
