import { Translation } from "@alice-localization/base/Translation";
import { AccountTransferStrings } from "../AccountTransferLocalization";
import { hyperlink, messageLink } from "discord.js";
import { Constants } from "@alice-core/Constants";

/**
 * The English translation for the `accountTransfer` slash command.
 */
export class AccountTransferENTranslation extends Translation<AccountTransferStrings> {
    override readonly translations: AccountTransferStrings = {
        aboutEmbedTitle: "About osu!droid Account Transfer",
        aboutEmbedDescription1:
            "In osu!droid version 1.7.3, alternate osu!droid accounts are not allowed. This is in accordance with the implementation of droid performance points (dpp) in the version, as allowing alternate accounts would destroy leaderboard and ranking integrity.",
        aboutEmbedDescription2:
            "As many players have alternate osu!droid accounts, an account transfer operation will be carried to transfer all scores from a player's osu!droid accounts into an osu!droid account.",
        aboutEmbedDescription3:
            "This command is built to help players manage their osu!droid accounts. They can add osu!droid accounts to be included in the transfer operation and choose the osu!droid account that they want to be transferred to.",
        aboutEmbedDescription4: `Please check ${hyperlink("this", messageLink("1119504562282299452", "1265336517874684036", Constants.mainServer))} announcement for more information.`,
        transferInfoEmbedTitle: "osu!droid Account Transfer Information",
        transferInfoEmbedTargetName: "Transfer Target",
        transferInfoAccountListName: "osu!droid Accounts To Transfer",
        playerNotFound: "I'm sorry, I could not find a player with that uid!",
        noAccountTransfer:
            "I'm sorry, I could not find your osu!droid account transfer information!",
        incorrectEmail:
            "I'm sorry, the email that you have entered is not associated with the osu!droid account that you are adding!",
        accountAlreadyAddedBySelf:
            "I'm sorry, you have already added that osu!droid account!",
        accountAlreadyAddedByOther:
            "I'm sorry, that osu!droid account has been added by someone else!",
        accountNotInTransferList:
            "I'm sorry, this osu!droid account is not in your transfer list! Please add it first.",
        setTransferAccountFailed:
            "I'm sorry, I could not set your transfer account: %s.",
        setTransferAccountSuccess:
            "Successfully set your transfer account to uid %s.",
        addAccountFailed:
            "I'm sorry, I could not add the osu!droid account: %s.",
        addAccountSuccess:
            "Successfully added the osu!droid account to your transfer list.",
    };
}
