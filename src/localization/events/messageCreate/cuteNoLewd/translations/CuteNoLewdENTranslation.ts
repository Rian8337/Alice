import { Translation } from "@localization/base/Translation";
import { CuteNoLewdStrings } from "../CuteNoLewdLocalization";

/**
 * The English translation for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdENTranslation extends Translation<CuteNoLewdStrings> {
    override readonly translations: CuteNoLewdStrings = {
        imageSentTooFast:
            "%s, you are only allowed to send 1 picture every 5 seconds!",
    };
}
