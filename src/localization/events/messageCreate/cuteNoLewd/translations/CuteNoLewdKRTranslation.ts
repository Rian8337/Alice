import { Translation } from "@alice-localization/base/Translation";
import { CuteNoLewdStrings } from "../CuteNoLewdLocalization";

/**
 * The Korean translation for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdKRTranslation extends Translation<CuteNoLewdStrings> {
    override readonly translations: CuteNoLewdStrings = {
        imageSentTooFast: "%s, 5초에 한 개의 이미지만 올릴 수 있어요!",
    };
}
