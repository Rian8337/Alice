import { Translation } from "@alice-localization/base/Translation";
import { ShowMostRecentPlayStrings } from "../ShowMostRecentPlayLocalization";

/**
 * The English translation for the `showMostRecentPlay` button command.
 */
export class ShowMostRecentPlayENTranslation extends Translation<ShowMostRecentPlayStrings> {
    override readonly translations: ShowMostRecentPlayStrings = {
        userNotBinded:
            "I'm sorry, you have not binded an osu!droid account! Please follow the procedure outlined above to bind your osu!droid account.",
        profileNotFound: "I'm sorry, I cannot find your profile!",
        playerHasNoRecentPlays:
            "I'm sorry, this player has not submitted any scores!",
        recentPlayDisplay: "Recent play for %s:",
    };
}
