import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CuteNoLewdStrings {
    readonly imageSentTooFast: string;
}

/**
 * Localizations for the `cuteNoLewd` event utility in `messageCreate` event.
 */
export class CuteNoLewdLocalization extends Localization<CuteNoLewdStrings> {
    protected override readonly translations: Readonly<
        Translation<CuteNoLewdStrings>
    > = {
        en: {
            imageSentTooFast:
                "%s, you are only allowed to send 1 picture every 5 seconds!",
        },
        kr: {
            imageSentTooFast: "%s, 5초에 한 개의 이미지만 올릴 수 있어요!",
        },
    };
}
