import { Translation } from "@localization/base/Translation";
import { ProfileCardCreatorStrings } from "../ProfileCardCreatorLocalization";

/**
 * The Spanish translation for the `ProfileCardCreator` creator utility.
 */
export class ProfileCardCreatorESTranslation extends Translation<ProfileCardCreatorStrings> {
    override readonly translations: ProfileCardCreatorStrings = {
        totalScore: "Puntaje Total",
        accuracy: "Precisión",
        playCount: "Jugadas",
        performancePoints: "",
        clan: "Clan",
        challengePoints: "Puntos de desafio",
    };
}
