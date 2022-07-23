import { Translation } from "@alice-localization/base/Translation";
import { DroidProfileStrings } from "../DroidProfileLocalization";

/**
 * The Indonesian translation for the `droidProfile` event utility in `messageCreate` event.
 */
export class DroidProfileIDTranslation extends Translation<DroidProfileStrings> {
    override readonly translations: DroidProfileStrings = {
        droidProfile: "Profil osu!droid untuk %s:",
    };
}
