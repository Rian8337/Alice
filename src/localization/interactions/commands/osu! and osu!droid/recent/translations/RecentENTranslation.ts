import { Translation } from "@localization/base/Translation";
import { RecentStrings } from "../RecentLocalization";

/**
 * The English translation for the `recent` command.
 */
export class RecentENTranslation extends Translation<RecentStrings> {
    override readonly translations: RecentStrings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        playerNotFound:
            "I'm sorry, I cannot find the player that you are looking for!",
        playerHasNoRecentPlays:
            "I'm sorry, this player has not submitted any scores!",
        playIndexOutOfBounds:
            "I'm sorry, this player does not have a %s-th recent play!",
        recentPlayDisplay: "Recent play for %s:",
    };
}
