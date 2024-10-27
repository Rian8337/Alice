import { Translation } from "@localization/base/Translation";
import { ProfileCardCreatorStrings } from "../ProfileCardCreatorLocalization";

/**
 * The Korean translation for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorKRTranslation extends Translation<ProfileCardCreatorStrings> {
    override readonly translations: ProfileCardCreatorStrings = {
        totalScore: "총 점수",
        accuracy: "정확도",
        playCount: "플레이 횟수",
        droidPP: "Droid pp",
        clan: "클랜",
        challengePoints: "챌린지 포인트",
    };
}
