import { Translation } from "@alice-localization/base/Translation";
import { ScanStrings } from "../ScanLocalization";

/**
 * The Spanish translation of the `scan` command.
 */
export class ScanESTranslation extends Translation<ScanStrings> {
    override readonly translations: ScanStrings = {
        scanComplete: "%s, escaneo completado!",
        scanStarted: "Escaneo iniciado!",
    };
}
