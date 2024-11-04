import { Translation } from "@localization/base/Translation";
import { ProfileCardCreatorStrings } from "../ProfileCardCreatorLocalization";

/**
 * The Indonesian translation for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorIDTranslation extends Translation<ProfileCardCreatorStrings> {
    override readonly translations: ProfileCardCreatorStrings = {
        totalScore: "",
        accuracy: "",
        playCount: "",
        performancePoints: "",
        clan: "",
        challengePoints: "",
    };
}
