import { Translation } from "@alice-localization/base/Translation";
import { MapshareSubmissionStrings } from "../MapshareSubmissionLocalization";

/**
 * The English translation for the `mapshare-postsubmission` modal command.
 */
export class MapshareSubmissionENTranslation extends Translation<MapshareSubmissionStrings> {
    override readonly translations: MapshareSubmissionStrings = {
        noBeatmapFound: "Hey, please enter a valid beatmap link or ID!",
        beatmapIsTooEasy:
            "I'm sorry, you can only submit beatmaps that are 3* or higher!",
        beatmapHasLessThan50Objects:
            "I'm sorry, it seems like the beatmap has less than 50 objects!",
        beatmapHasNoCirclesOrSliders:
            "I'm sorry, the beatmap has no circles and sliders!",
        beatmapDurationIsLessThan30Secs:
            "I'm sorry, the beatmap's duration is too short! It must be at least 30 seconds.",
        beatmapIsWIPOrQualified:
            "I'm sorry, you cannot submit a WIP (Work In Progress) and qualified beatmaps!",
        beatmapWasJustSubmitted:
            "I'm sorry, this beatmap was submitted in less than a week ago!",
        beatmapWasJustUpdated:
            "I'm sorry, this beatmap was just updated in less than 3 days ago!",
        beatmapHasBeenUsed:
            "I'm sorry, this beatmap has been submitted as a submission before!",
        summaryWordCountNotValid:
            "I'm sorry, your summary's length is currently %s word(s) long! It must be between 50 and 120 words!",
        submitFailed: "I'm sorry, I couldn't submit your submission: %s.",
        submitSuccess: "Successfully submitted your submission.",
    };
}
