import { Translation } from "@alice-localization/base/Translation";
import { UserbindStrings } from "../UserbindLocalization";

/**
 * The Spanish translation for the `userbind` command.
 */
export class UserbindESTranslation extends Translation<UserbindStrings> {
    override readonly translations: UserbindStrings = {
        profileNotFound:
            "Lo siento, no puedo encontrar el perfil de esa cuenta!",
        verificationMapNotFound:
            "Lo siento, esta cuenta no ha jugado el mapa de verificación! Por favor, use `/userbind verifymap` para poder obtenerlo.",
        newAccountBindNotInMainServer:
            "Lo siento, enlazar una cuenta nueva a su perfil debe ser realizado en el Discord Internacional de osu!Droid! Esto es fundamental para poder llevar la moderación a mejor manera.",
        newAccountBindNotVerified:
            "Lo siento, tu debes ser un miembro verificado para poder usar este comando!",
        newAccountUidBindConfirmation:
            "Estas seguro que quieres enlazar el UID %s a tu perfil?",
        newAccountUsernameBindConfirmation:
            "Estas seguro que quieres enlazar la cuenta con nick %s a tu perfil?",
        newAccountUidBindSuccessful:
            "Cuenta con uid %s enlazada correctamente. Puedes enlazar %s cuenta(s) más a tu perfil.",
        newAccountUsernameBindSuccessful:
            "Cuenta con nick %s enlazada correctamente. Puedes enlazar %s cuenta(s) más a tu perfil.",
        accountUidBindError:
            "Lo siento, no pude enlazar la cuenta con uid %s: %s.",
        accountUsernameBindError:
            "Lo siento, no pude enlazar la cuenta de nick %s: %s.",
        accountHasBeenBindedError:
            "Lo siento, esa cuenta de osu!droid ya ha sido enlazada a otro perfil de Discord!",
        oldAccountUidBindSuccessful:
            "Cuenta con uid %s enlazada correctamente.",
        oldAccountUsernameBindSuccessful:
            "Cuenta con nick %s enlazada correctamente.",
        verificationMapInformation:
            "Use este mapa para poder verificar que realmente eres el dueño de la cuenta de osu!droid. Esto es un requisito si quieres enlazar la cuenta por primera vez.",
    };
}
