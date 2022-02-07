/**
 * Strings for the `settings` command.
 */
export enum settingsStrings {
    chosenChannelIsNotText = "Hey, please choose a text channel!",
    setLogChannelSuccess = "Successfully set your guild's punishment log channel to %s.",
    unsetLogChannelSuccess = "Successfully unset your guild's punishment log channel.",
    noLogChannelConfigured = "I'm sorry, this server doesn't have a punishment log channel configured! Please set a punishment log channel first!",
    grantOrRevokeTimeoutImmunitySuccess = "Successfully %s timeout immunity for %s role.",
    grantOrRevokeTimeoutPermissionSuccess = "Successfully %s timeout permission for %s role.",
    invalidTimeoutPermissionDuration = "Hey, please enter a proper maximum timeout duration!",
    eventNotFound = "I'm sorry, I cannot find the event that you have specified!",
    eventUtilityNotFound = "I'm sorry, I cannot find the event utility that you have specified!",
    eventUtilityToggleSuccess = "Successfully %s event utility `%s` for event `%s`.",
    commandNotFound = "I'm sorry, I cannot find the command that you have specified!",
    cannotDisableCommand = "I'm sorry, you cannot disable or put a cooldown to this command!",
    setCommandCooldownFailed = "I'm sorry, I'm unable to set the command's cooldown: %s.",
    setCommandCooldownSuccess = "Successfully set `%s` cooldown to %s second(s).",
    disableCommandFailed = "I'm sorry, I'm unable to disable the command: %s.",
    disableCommandSuccess = "Successfully disabled `%s` command.",
    enableCommandFailed = "I'm sorry, I'm unable to enable the command: %s.",
    enableCommandSuccess = "Successfully enabled `%s` command.",
    setGlobalCommandCooldownSuccess = "Successfully set global command cooldown to `%s` second(s).",
}
