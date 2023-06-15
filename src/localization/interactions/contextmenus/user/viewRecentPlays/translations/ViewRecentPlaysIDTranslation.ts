import { Translation } from "@alice-localization/base/Translation";
import { ViewRecentPlaysStrings } from "../ViewRecentPlaysLocalization";

/**
 * The Indonesian translation for the `viewRecentPlays` user context menu command.
 */
export class ViewRecentPlaysIDTranslation extends Translation<ViewRecentPlaysStrings> {
    override readonly translations: ViewRecentPlaysStrings = {
        selfProfileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        userProfileNotFound:
            "Maaf, aku tidak dapat menemukan profile pemain tersebut!",
        playerHasNoRecentPlays:
            "Maaf, pemain ini belum pernah mengirimkan skor!",
    };
}
