import { Translation } from "@localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Spanish translation for the `userbind` command.
 */
export class UserbindESTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound:
            "Lo siento, no puedo encontrar el perfil de esa cuenta!",
        incorrectEmail: "",
        bindConfirmation:
            "Estas seguro que quieres enlazar la cuenta con %s a tu perfil?",
        discordAccountAlreadyBoundError: "",
        bindError: "Lo siento, no pude enlazar la cuenta: %s.",
        accountHasBeenBoundError:
            "Lo siento, esa cuenta de osu!droid ya ha sido enlazada a otro perfil de Discord!",
        bindSuccessful: "Cuenta con %s enlazada correctamente.",
    };
}
