import { Translation } from "@alice-localization/base/Translation";
import { MapshareSubmissionStrings } from "../MapshareSubmissionLocalization";

/**
 * The Indonesian translation for the `mapshare-postsubmission` modal command.
 */
export class MapshareSubmissionIDTranslation extends Translation<MapshareSubmissionStrings> {
    override readonly translations: MapshareSubmissionStrings = {
        noBeatmapFound: "",
        beatmapIsTooEasy: "",
        beatmapHasLessThan50Objects: "",
        beatmapHasNoCirclesOrSliders: "",
        beatmapDurationIsLessThan30Secs: "",
        beatmapIsWIPOrQualified: "",
        beatmapWasJustSubmitted: "",
        beatmapWasJustUpdated: "",
        beatmapHasBeenUsed: "",
        summaryWordCountNotValid: "",
        submitFailed: "",
        submitSuccess: "",
    };
}
