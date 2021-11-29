/**
 * Strings for the `namechange` command.
 */
export enum namechangeStrings {
    noActiveRequest = "I'm sorry, there is no active name change request now!",
    invalidUid = "Hey, please enter a valid uid!",
    uidHasNoActiveRequest = "I'm sorry, this user does not have an active name change request!",
    newNameAlreadyTaken = "I'm sorry, the requested username has been taken!",
    acceptSuccess = "Successfully accepted name change request.",
    acceptUserNotification = "Hey, I would like to inform you that your name change request was accepted. You will be able to change your username again in %s.",
    denySuccess = "Successfully denied name change request for `%s`.",
    denyUserNotification = "Hey, I would like to inform you that your name change request was denied due to `%s`. You are not subjected to the 30-day cooldown yet, so feel free to submit another request. Sorry in advance!",
    activeRequestExists = "Hey, you currently have an active request! Please wait for that one to get reviewed before submitting another one!",
    requestCooldownNotExpired = "I'm sorry, you're still in cooldown! You will be able to send a name change request in `%s`.",
    currentBindedAccountDoesntExist = "I'm sorry, I cannot find your currently binded account in osu!droid server!",
    newUsernameContainsUnicode = "I'm sorry, usernames can only contain letters, numbers, and underscores!",
    newUsernameTooLong = "I'm sorry, a username must be at least 2 characters and doesn't exceed 20 characters!",
    emailNotEqualToBindedAccount = "I'm sorry, the email you have provided is not the same as the email registered to your binded osu!droid account!",
    requestSuccess = "Successfully requested name change. Please wait for it to get reviewed!\n\nRemember to not disable your Direct Messages or else you won't get notified of your name change request status!",
    userHasNoHistory = "I'm sorry, this player doesn't have any name change history!"
}