import { Translation } from "@alice-localization/base/Translation";
import { CuteNoLewdStrings } from "../CuteNoLewdLocalization";

/**
 * The Indonesian translation for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdIDTranslation extends Translation<CuteNoLewdStrings> {
    override readonly translations: CuteNoLewdStrings = {
        imageSentTooFast: "",
    };
}
