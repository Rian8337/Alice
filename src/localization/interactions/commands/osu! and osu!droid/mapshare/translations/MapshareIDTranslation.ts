import { Translation } from "@alice-localization/base/Translation";
import { MapshareStrings } from "../MapshareLocalization";

/**
 * The Indonesian translation for the `mapshare` command.
 */
export class MapshareIDTranslation extends Translation<MapshareStrings> {
    override readonly translations: MapshareStrings = {
        noSubmissionWithStatus: "",
        noBeatmapFound: "",
        beatmapIsOutdated: "",
        noSubmissionWithBeatmap: "",
        submissionIsNotPending: "",
        userIsAlreadyBanned: "",
        userIsNotBanned: "",
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
        submitModalTitle: "",
        submitModalBeatmapLabel: "",
        submitModalBeatmapPlaceholder: "",
        submitModalSummaryLabel: "",
        submitModalSummaryPlaceholder: "",
    };
}
