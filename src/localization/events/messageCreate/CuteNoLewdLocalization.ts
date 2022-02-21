import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface CuteNoLewdStrings {
    readonly imageSentTooFast: "%s, you are only allowed to send 1 picture every 5 seconds!";
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
    };
}
