/**
 * Strings for the `userbind` command.
 */
export enum userbindStrings {
    profileNotFound = "I'm sorry, I couldn't find that account's profile!",
    verificationMapNotFound = "I'm sorry, this account has not played the verification beatmap! Please use `/userbind verifymap` to get the verification beatmap.",
    newAccountBindNotInMainServer = "I'm sorry, new account binding must be done in the osu!droid International Discord server! This is required to keep bind moderation at ease.",
    newAccountBindNotVerified = "I'm sorry, you must be a verified member to use this command!",
    newAccountBindConfirmation = "Are you sure you want to bind your account to %s %s?",
    newAccountBindSuccessful = "Successfully binded your account to %s %s. You can bind %s more osu!droid account%s.",
    accountBindError = "I'm sorry, I couldn't bind your account to %s %s: %s.",
    accountHasBeenBindedError = "I'm sorry, that osu!droid account has been binded to another Discord account!",
    oldAccountBindSuccessful = "Successfully binded your account to %s %s.",
    verificationMapInformation = "Use this beatmap to verify that you are the owner of an osu!droid account. This is required if you want to bind it for the first time.",
}
