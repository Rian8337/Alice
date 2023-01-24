import { Translation } from "@alice-localization/base/Translation";
import { ShowRecentPlaysStrings } from "../ShowRecentPlaysLocalization";

/**
 * The English translation for the `showRecentPlays` button command.
 */
export class ShowRecentPlaysENTranslation extends Translation<ShowRecentPlaysStrings> {
    override readonly translations: ShowRecentPlaysStrings = {
        userNotBinded:
            "I'm sorry, you have not binded an osu!droid account! Please follow the procedure outlined above to bind your osu!droid account.",
        profileNotFound: "I'm sorry, I cannot find your profile!",
    };
}
