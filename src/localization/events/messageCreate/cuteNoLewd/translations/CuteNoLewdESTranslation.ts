import { Translation } from "@localization/base/Translation";
import { CuteNoLewdStrings } from "../CuteNoLewdLocalization";

/**
 * The Spanish translation for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdESTranslation extends Translation<CuteNoLewdStrings> {
    override readonly translations: CuteNoLewdStrings = {
        imageSentTooFast:
            "%s, solo tienes permitido enviar 1 imagen cada 5 segundos!",
    };
}
