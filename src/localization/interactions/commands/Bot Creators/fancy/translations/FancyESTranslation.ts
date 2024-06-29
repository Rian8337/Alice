import { Translation } from "@alice-localization/base/Translation";
import { FancyStrings } from "../FancyLocalization";

/**
 * The Spanish translation for the `fancy` command.
 */
export class FancyESTranslation extends Translation<FancyStrings> {
    override readonly translations: FancyStrings = {
        durationError: "Hey, por favor ingresa una duración válida!",
        cannotRetrieveTatsuXP: "",
        tatsuXPRequirementNotMet: "",
        applicationMessageEmbedTitle: "",
        applicationMessageEmbedDescription: "",
        applicationMessageInitiateVote: "",
        applicationMessageRejectApplication: "",
        applicationFailed: "",
        applicationSent: "",
        lockProcessFailed: "Lo siento, no puedo bloquear al usuario: %s.",
        lockProcessSuccessful:
            "Lo siento, no puedo desbloquear al usuario: %s.",
        unlockProcessFailed: "Usuario bloqueado satisfactoriamente.",
        unlockProcessSuccessful: "Usuario desbloqueado satisfactoriamente.",
    };
}
