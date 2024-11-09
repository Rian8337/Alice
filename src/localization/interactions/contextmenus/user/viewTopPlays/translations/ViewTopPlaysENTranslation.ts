import { Translation } from "@localization/base/Translation";
import { ViewTopPlaysStrings } from "../ViewTopPlaysLocalization";

/**
 * The English translation for the `viewTopPlays` user context menu.
 */
export class ViewTopPlaysENTranslation extends Translation<ViewTopPlaysStrings> {
    override readonly translations: ViewTopPlaysStrings = {
        profileNotFound: "I'm sorry, I couldn't find the user's profile!",
    };
}
