import { Translation } from "@alice-localization/base/Translation";
import { ProfileCardCreatorStrings } from "../ProfileCardCreatorLocalization";

/**
 * The Spanish translation for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorESTranslation extends Translation<ProfileCardCreatorStrings> {
    override readonly translations: ProfileCardCreatorStrings = {
        totalScore: "Puntaje Total",
        accuracy: "Precisión",
        playCount: "Jugadas",
        droidPP: "Droid pp",
        clan: "Clan",
        challengePoints: "Puntos de desafio",
    };
}
