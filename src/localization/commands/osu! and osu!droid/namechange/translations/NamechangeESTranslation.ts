import { Translation } from "@alice-localization/base/Translation";
import { NamechangeStrings } from "../NamechangeLocalization";

/**
 * The Spanish translation for the `namechange` command.
 */
export class NamechangeESTranslation extends Translation<NamechangeStrings> {
    override readonly translations: NamechangeStrings = {
        noActiveRequest:
            "Lo siento, no hay ningún cambio de nick activo ahora!",
        invalidUid: "Hey, por favor ingresar un uid válido!",
        uidHasNoActiveRequest:
            "Lo siento, este usuario no tiene ninguna petición de cambio de nick activo!",
        userHasNoActiveRequest:
            "Lo siento, no tienes ninguna petición activa para cambio de nick!",
        newNameAlreadyTaken: "Lo siento, el nick elegido ya está siendo usado!",
        activeRequestExists:
            "Hey, actualmente tienes un cambio de nick activo! Por favor, espera a que sea revisado antes de registrar uno nuevo!",
        requestCooldownNotExpired:
            "Lo siento, continuas en espera! Podrás solicitar un cambio de nick en %s",
        currentBindedAccountDoesntExist:
            "Lo siento, no puedo encontrar tu cuenta enlazada en el servidor de osu!droid!",
        newUsernameContainsUnicode:
            "Lo siento, los nicks solo pueden contener letras, numeros y guiones!",
        newUsernameTooLong:
            "Lo siento, el nick debe de tener al menos 2 caracteres y no pasarse de los 20!",
        emailNotEqualToBindedAccount:
            "Lo siento, el email que has proporcionado no es mismo que el email registrado a tu cuenta de osu!droid!",
        requestSuccess:
            "Petición registrada correctamente. Por favor, esperar a revisión!\n\nRecuerda no desactivar los mensajes directos, ya que sino no serás notificado del estado de tu pedido de cambio de nick!",
        userHasNoHistory:
            "Lo siento, este jugador no tiene historial de cambios de nick!",
        acceptFailed: "Lo siento, no pude aceptar el cambio de nick: %s.",
        acceptSuccess: "Cambio de nick aceptado correctamente.",
        cancelFailed: "Lo siento, no pude cancelar el cambio de nick: %s.",
        cancelSuccess: "Cambio de nick cancelado correctamente.",
        denyFailed: "Lo siento, no pude rechazar el cambio de nick: %s.",
        denySuccess: "Cambio de nick rechazado correctamente por %s.",
        nameHistoryForUid: "Historial de nicks con el UID %s",
        nameHistory: "Historial de nicks.",
        nameChangeRequestList: "Lista de pedidos de cambios de nick.",
        discordAccount: "Cuenta de discord",
        usernameRequested: "Nick solicitado",
        creationDate: "Fecha de creación",
    };
}
