import { Translation } from "@alice-localization/base/Translation";
import { ProfileCardCreatorStrings } from "../ProfileCardCreatorLocalization";

/**
 * The Indonesian translation for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorIDTranslation extends Translation<ProfileCardCreatorStrings> {
    override readonly translations: ProfileCardCreatorStrings = {
        totalScore: "",
        rankedScore: "",
        accuracy: "",
        playCount: "",
        droidPP: "",
        clan: "",
        challengePoints: "",
    };
}
