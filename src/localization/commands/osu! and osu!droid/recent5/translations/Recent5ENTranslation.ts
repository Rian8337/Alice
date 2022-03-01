import { Translation } from "@alice-localization/base/Translation";
import { Recent5Strings } from "../Recent5Localization";

/**
 * The English translation for the `recent5` command.
 */
export class Recent5ENTranslation extends Translation<Recent5Strings> {
    override readonly translations: Recent5Strings = {
        tooManyOptions:
            "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
        playerNotFound:
            "I'm sorry, I cannot find the player that you are looking for!",
        playerHasNoRecentPlays:
            "I'm sorry, this player has not submitted any scores!",
    };
}
