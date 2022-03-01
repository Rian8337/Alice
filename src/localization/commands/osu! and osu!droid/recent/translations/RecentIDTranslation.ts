import { Translation } from "@alice-localization/base/Translation";
import { RecentStrings } from "../RecentLocalization";

/**
 * The Indonesian translation for the `recent` command.
 */
export class RecentIDTranslation extends Translation<RecentStrings> {
    override readonly translations: RecentStrings = {
        tooManyOptions: "",
        playerNotFound: "",
        playerHasNoRecentPlays: "",
        playIndexOutOfBounds: "",
        recentPlayDisplay: "",
    };
}
