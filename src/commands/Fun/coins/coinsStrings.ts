/**
 * Strings for the `coins` command.
 */
export enum coinsStrings {
    userNotInServerForAWeek = "I'm sorry, you haven't been in the server for a week!",
    dailyClaimFailed = "I'm sorry, I couldn't process your daily coins claim: %s.",
    dailyClaimSuccess = "You have %sclaimed `%s` Alice coins! Your current streak is `%s`. You now have `%s` Alice coins.",
    coinAmountInfo = "%s `%s` Alice coins.",
    userToTransferNotFound = "I'm sorry, I cannot find the user to give your coins to!",
    userToTransferIsBot = "Hey, you cannot transfer coins to a bot!",
    userToTransferIsSelf = "Hey, you cannot transfer coins to yourself!",
    transferAmountInvalid = "Hey, I need a valid amount of coins to transfer!",
    userToTransferNotInServerForAWeek = "I'm sorry, the user you are giving your coins to has not been in the server for a week!",
    userDoesntHaveCoinsInfo = "I'm sorry, I cannot find information about your Alice coins!",
    otherUserDoesntHaveCoinsInfo = "I'm sorry, I cannot find information about the user's Alice coins!",
    cannotFetchPlayerInformation = "I'm sorry, I cannot find your osu!droid profile!",
    notEnoughCoinsToTransfer = "I'm sorry, you don't have enough coins!",
    coinTransferConfirmation = "Are you sure you want to transfer `%s` Alice coins to %s?",
    coinTransferFailed = "I'm sorry, I'm unable to transfer your Alice coins: %s.",
    coinTransferSuccess = "Successfully transferred `%s` Alice coins to %s. You can transfer `%s` Alice coins left today. You now have `%s` Alice coins.",
    addAmountInvalid = "Hey, I need a valid amount of coins to add!",
    addCoinSuccess = "Successfully added `%s` Alice coins to the user. The user now has `%s` Alice coins.",
    addCoinFailed = "I'm sorry, I couldn't add Alice coins to the user: %s.",
    removeAmountInvalid = "Hey, I need a valid amount of coins to remove!",
    removeCoinFailed = "I'm sorry, I cannot remove the user's Alice coins: %s.",
    removeCoinSuccess = "Successfully removed `%s` Alice coins from user. The user now has `%s` Alice coins."
}