import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RecentStrings {
    readonly tooManyOptions: string;
    readonly playerNotFound: string;
    readonly playerHasNoRecentPlays: string;
    readonly playIndexOutOfBounds: string;
    readonly recentPlayDisplay: string;
}

/**
 * Localizations for the `recent` command.
 */
export class RecentLocalization extends Localization<RecentStrings> {
    protected override readonly translations: Readonly<Translation<RecentStrings>> = {
        en: {
            tooManyOptions: "I'm sorry, you can only either specify a uid, user, or username! You cannot mix them!",
            playerNotFound: "I'm sorry, I cannot find the player that you are looking for!",
            playerHasNoRecentPlays: "I'm sorry, this player has not submitted any scores!",
            playIndexOutOfBounds: "I'm sorry, this player does not have a %s-th recent play!",
            recentPlayDisplay: "Recent play for %s:",
        }
    };
}