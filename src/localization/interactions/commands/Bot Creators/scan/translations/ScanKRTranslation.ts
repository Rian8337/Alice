import { Translation } from "@localization/base/Translation";
import { ScanStrings } from "../ScanLocalization";

/**
 * The Korean translation of the `scan` command.
 */
export class ScanKRTranslation extends Translation<ScanStrings> {
    override readonly translations: ScanStrings = {
        scanComplete: "%s, 스캔 완료!",
        scanStarted: "스캔 시작!",
    };
}
