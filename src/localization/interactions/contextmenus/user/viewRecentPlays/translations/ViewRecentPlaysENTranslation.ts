import { Translation } from "@alice-localization/base/Translation";
import { ViewRecentPlaysStrings } from "../ViewRecentPlaysLocalization";

/**
 * The English translation for the `viewRecentPlays` user context menu command.
 */
export class ViewRecentPlaysENTranslation extends Translation<ViewRecentPlaysStrings> {
    override readonly translations: ViewRecentPlaysStrings = {
        selfProfileNotFound: "I'm sorry, I cannot find your profile!",
        userProfileNotFound: "I'm sorry, I cannot find the player's profile!",
    };
}
