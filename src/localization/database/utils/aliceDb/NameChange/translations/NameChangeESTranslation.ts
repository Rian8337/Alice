import { Translation } from "@alice-localization/base/Translation";
import { NameChangeStrings } from "../NameChangeLocalization";

/**
 * The Spanish translation for the `NameChange` database utility.
 */
export class NameChangeESTranslation extends Translation<NameChangeStrings> {
    override readonly translations: NameChangeStrings = {
        requestNotActive: "petición de cambio de nick no esta activo",
        playerNotFound: "No se puede encontrar perfil del jugador",
        droidServerRequestFailed:
            "No se puede crear solicitud al server de osu!droid",
        newUsernameTaken: "Nuevo nick usado",
        requestDetails: "Detalles de la solicitud",
        currentUsername: "Nick actual",
        requestedUsername: "Nick Solicitado",
        creationDate: "Fecha de Creación",
        status: "Estado",
        accepted: "Aceptado",
        acceptedNotification:
            "Hey, me gustaría informarte que tu cambio de nick fue aceptado! Podras solicitar el siguiente cambio nuevamente en %s.",
        denied: "Rechazado",
        reason: "Razon",
        deniedNotification:
            "Hey, me gustaría informarte que tu cambio de nick fue rechazado por `%s`. No estas obligado a esperar los 30 dias de espera, asi que puedes realizar otro cambio si asi lo deseas. Lamento el inconveniente!",
    };
}
