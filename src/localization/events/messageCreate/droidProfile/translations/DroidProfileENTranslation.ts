import { Translation } from "@alice-localization/base/Translation";
import { DroidProfileStrings } from "../DroidProfileLocalization";

/**
 * The English translation for the `droidProfile` event utility in `messageCreate` event.
 */
export class DroidProfileENTranslation extends Translation<DroidProfileStrings> {
    override readonly translations: DroidProfileStrings = {
        droidProfile: "osu!droid profile for %s:",
    };
}
