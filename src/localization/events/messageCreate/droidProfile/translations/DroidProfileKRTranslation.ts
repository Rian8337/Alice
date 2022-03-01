import { Translation } from "@alice-localization/base/Translation";
import { DroidProfileStrings } from "../DroidProfileLocalization";

/**
 * The Korean translation for the `droidProfile` event utility in `messageCreate` event.
 */
export class DroidProfileKRTranslation extends Translation<DroidProfileStrings> {
    override readonly translations: DroidProfileStrings = {
        droidProfile: "%s의 osu!droid 프로필:",
    };
}
