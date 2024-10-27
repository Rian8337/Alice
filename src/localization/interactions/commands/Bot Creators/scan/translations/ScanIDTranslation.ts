import { Translation } from "@localization/base/Translation";
import { ScanStrings } from "../ScanLocalization";

/**
 * The Indonesian translation of the `scan` command.
 */
export class ScanIDTranslation extends Translation<ScanStrings> {
    override readonly translations: ScanStrings = {
        scanComplete: "%s, pemindaian selesai!",
        scanStarted: "Pemindaian dimulai!",
    };
}
