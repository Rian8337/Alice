import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface ScanStrings {
    readonly scanComplete: string;
    readonly scanStarted: string;
}

/**
 * Localizations for the `scan` command.
 */
export class ScanLocalization extends Localization<ScanStrings> {
    protected override readonly translations: Readonly<
        Translation<ScanStrings>
    > = {
        en: {
            scanComplete: "%s, scan complete!",
            scanStarted: "Scan started!",
        },
        kr: {
            scanComplete: "%s, 스캔 완료!",
            scanStarted: "스캔 시작!",
        },
    };
}
