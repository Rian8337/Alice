import { Translation } from "@alice-localization/base/Translation";
import { DanCourseStrings } from "../DanCourseLocalization";

/**
 * The English translation for the `dancourse` command.
 */
export class DanCourseENTranslation extends Translation<DanCourseStrings> {
    override readonly translations: DanCourseStrings = {
        courseNotFound: "I'm sorry, I couldn't find the course!",
        courseHasNoScores: "I'm sorry, this course has no scores set yet!",
        topScore: "Top Score",
        noScoresSubmitted: "I'm sorry, you do not have any scores submitted!",
        threeFingerOrNonPassScoresSubmitted:
            "I'm sorry, you have already submitted at least one score, but they were either flagged for three finger or did not fulfill the course's pass requirement!",
        userPassedDanCourseFailed: "I'm sorry, you didn't pass `%s`: %s.",
        userPassedDanCourseSuccess: "Congratulations, you passed `%s`!",
    };
}
