import { Translation } from "@alice-localization/base/Translation";
import { CreateinviteStrings } from "../CreateinviteLocalization";

/**
 * The Spanish translation for the `createinvite` command.
 */
export class CreateinviteESTranslation extends Translation<CreateinviteStrings> {
    override readonly translations: CreateinviteStrings = {
        expiryTimeInvalid:
            "Hey, por favor ingresa un tiempo valido para el vencimiento de la invitación!",
        maximumUsageInvalid:
            "Hey, por favor ingresa una cantidad máxima válida para la invitacion!",
        inviteLinkCreated: "Invitación creada",
        createdInChannel: "Creada en",
        maxUsage: "Uso Máximo",
        infinite: "Infinito",
        expirationTime: "Fecha de expiración",
        never: "Nunca",
        reason: "Razón",
        inviteLink: "Invitación",
        notSpecified: "No especificado.",
    };
}
