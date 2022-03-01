import { Translation } from "@alice-localization/base/Translation";
import { MapshareStrings } from "../MapshareLocalization";

/**
 * The Indonesian translation for the `mapshare` command.
 */
export class MapshareIDTranslation extends Translation<MapshareStrings> {
    override readonly translations: MapshareStrings = {
        noSubmissionWithStatus: "",
        noBeatmapFound: "",
        noSubmissionWithBeatmap: "",
        submissionIsNotPending: "",
        userIsAlreadyBanned: "",
        userIsNotBanned: "",
        beatmapIsOutdated: "",
        beatmapIsTooEasy: "",
        beatmapHasLessThan50Objects: "",
        beatmapHasNoCirclesOrSliders: "",
        beatmapDurationIsLessThan30Secs: "",
        beatmapIsWIPOrQualified: "",
        beatmapWasJustSubmitted: "",
        beatmapWasJustUpdated: "",
        beatmapHasBeenUsed: "",
        summaryWordCountNotValid: "",
        summaryCharacterCountNotValid: "",
        denyFailed: "",
        denySuccess: "",
        acceptFailed: "",
        acceptSuccess: "",
        banFailed: "",
        banSuccess: "",
        unbanFailed: "",
        unbanSuccess: "",
        postFailed: "",
        postSuccess: "",
        submitFailed: "",
        submitSuccess: "",
        statusAccepted: "",
        statusDenied: "",
        statusPending: "",
        statusPosted: "",
        submissionStatusList: "",
        submissionFromUser: "",
        userId: "",
        beatmapId: "",
        beatmapLink: "",
        creationDate: "",
    };
}
