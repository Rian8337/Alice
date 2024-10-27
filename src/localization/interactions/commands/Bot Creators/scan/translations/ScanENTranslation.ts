import { Translation } from "@localization/base/Translation";
import { ScanStrings } from "../ScanLocalization";

/**
 * The English translation of the `scan` command.
 */
export class ScanENTranslation extends Translation<ScanStrings> {
    override readonly translations: ScanStrings = {
        scanComplete: "%s, scan complete!",
        scanStarted: "Scan started!",
    };
}
