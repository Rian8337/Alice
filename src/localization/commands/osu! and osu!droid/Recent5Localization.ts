import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface Recent5Strings {
    readonly tooManyOptions: string;
    readonly playerNotFound: string;
    readonly playerHasNoRecentPlays: string;
}

/**
 * Localizations for the `recent5` command.
 */
export class Recent5Localization extends Localization<Recent5Strings> {
    protected override readonly translations: Readonly<Translation<Recent5Strings>> = {
        en: {
            tooManyOptions: "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            playerNotFound: "I'm sorry, I cannot find the player that you are looking for!",
            playerHasNoRecentPlays: "I'm sorry, this player has not submitted any scores!",
        }
    };
}