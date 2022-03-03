import { Translation } from "@alice-localization/base/Translation";
import { DroidProfileStrings } from "../DroidProfileLocalization";

/**
 * The Spanish translation for the `droidProfile` event utility in `messageCreate` event.
 */
export class DroidProfileESTranslation extends Translation<DroidProfileStrings> {
    override readonly translations: DroidProfileStrings = {
        droidProfile: "Perfil de osu!droid de %s:",
    };
}
