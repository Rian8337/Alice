import { Translation } from "@localization/base/Translation";
import { CoinsStrings } from "../CoinsLocalization";

/**
 * The English translation for the `coins` command.
 */
export class CoinsENTranslation extends Translation<CoinsStrings> {
    override readonly translations: CoinsStrings = {
        claimNotAvailable:
            "I'm sorry, claiming Mahiru coins has been disabled until further notice.",
        userNotInServerForAWeek:
            "I'm sorry, you haven't been in the server for a week!",
        dailyClaimFailed:
            "I'm sorry, I couldn't process your daily coins claim: %s.",
        dailyClaimSuccess:
            "You have claimed `%s` Mahiru coins! Your current streak is `%s`. You now have `%s` Mahiru coins.",
        dailyClaimWithStreakSuccess:
            "You have completed a streak and claimed `%s` Mahiru coins! Your current streak is `%s`. You now have `%s` Mahiru coins.",
        selfCoinAmountInfo: "You have `%s` Mahiru coins.",
        userCoinAmountInfo: "That user has `%s` Mahiru coins.",
        userToTransferNotFound:
            "I'm sorry, I cannot find the user to give your coins to!",
        userToTransferIsBot: "Hey, you cannot transfer coins to a bot!",
        userToTransferIsSelf: "Hey, you cannot transfer coins to yourself!",
        transferAmountInvalid:
            "Hey, I need a valid amount of coins to transfer!",
        userToTransferNotInServerForAWeek:
            "I'm sorry, the user you are giving your coins to has not been in the server for a week!",
        userDoesntHaveCoinsInfo:
            "I'm sorry, I cannot find information about your Mahiru coins!",
        otherUserDoesntHaveCoinsInfo:
            "I'm sorry, I cannot find information about the user's Mahiru coins!",
        cannotFetchPlayerInformation:
            "I'm sorry, I cannot find your osu!droid profile!",
        notEnoughCoinsToTransfer: "I'm sorry, you don't have enough coins!",
        coinTransferConfirmation:
            "Are you sure you want to transfer `%s` Mahiru coins to %s?",
        coinTransferFailed:
            "I'm sorry, I'm unable to transfer your Mahiru coins: %s.",
        coinTransferSuccess:
            "Successfully transferred `%s` Mahiru coins to %s. You can transfer `%s` Mahiru coins left today. You now have `%s` Mahiru coins.",
        addAmountInvalid: "Hey, I need a valid amount of coins to add!",
        addCoinSuccess:
            "Successfully added `%s` Mahiru coins to the user. The user now has `%s` Mahiru coins.",
        addCoinFailed:
            "I'm sorry, I couldn't add Mahiru coins to the user: %s.",
        removeAmountInvalid: "Hey, I need a valid amount of coins to remove!",
        removeCoinFailed:
            "I'm sorry, I cannot remove the user's Mahiru coins: %s.",
        removeCoinSuccess:
            "Successfully removed `%s` Mahiru coins from user. The user now has `%s` Mahiru coins.",
    };
}
