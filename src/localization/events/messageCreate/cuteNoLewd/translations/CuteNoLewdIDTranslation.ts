import { Translation } from "@localization/base/Translation";
import { CuteNoLewdStrings } from "../CuteNoLewdLocalization";

/**
 * The Indonesian translation for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdIDTranslation extends Translation<CuteNoLewdStrings> {
    override readonly translations: CuteNoLewdStrings = {
        imageSentTooFast:
            "%s, kamu hanya dapat mengirim gambar setiap 5 detik!",
    };
}
