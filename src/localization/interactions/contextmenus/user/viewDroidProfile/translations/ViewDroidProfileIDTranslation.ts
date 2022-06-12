import { Translation } from "@alice-localization/base/Translation";
import { ViewDroidProfileStrings } from "../ViewDroidProfileLocalization";

/**
 * The Indonesian translation for the `viewDroidProfile` user context menu command.
 */
export class ViewDroidProfileIDTranslation extends Translation<ViewDroidProfileStrings> {
    override readonly translations: ViewDroidProfileStrings = {
        selfProfileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        userProfileNotFound:
            "Maaf, aku tidak dapat menemukan profile pemain tersebut!",
        viewingProfile: "Profil osu!droid untuk %s:\n<%s>",
    };
}
