import { Translation } from "@alice-localization/base/Translation";
import { CalculateStrings } from "../CalculateLocalization";

/**
 * The Indonesian translation for the `calculate` command.
 */
export class CalculateIDTranslation extends Translation<CalculateStrings> {
    override readonly translations: CalculateStrings = {
        noBeatmapProvided: "",
        beatmapProvidedIsInvalid: "",
        beatmapNotFound: "",
        rawDroidSr: "",
        rawDroidPp: "",
        rawPcSr: "",
        rawPcPp: "",
    };
}
