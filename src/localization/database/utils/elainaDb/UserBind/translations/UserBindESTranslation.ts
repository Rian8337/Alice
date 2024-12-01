import { Translation } from "@localization/base/Translation";
import { UserBindStrings } from "../UserBindLocalization";

/**
 * The Spanish translation for the `UserBind` database utility.
 */
export class UserBindESTranslation extends Translation<UserBindStrings> {
    override readonly translations: UserBindStrings = {
        uidNotBindedToAccount:
            "Ese UID no esta enlazado a esta cuenta de discord",
        cannotRebindToSameAccount:
            "No puedes enlazarlo a la misma cuenta de discord",
        targetAccountAlreadyBound: "",
        playerNotFound: "jugador no encontrado",
        playerWithUidOrUsernameNotFound:
            "jugador con ese nick / UID no puede ser encontrado",
        unbindClanDisbandNotification:
            "Hey, toda cuenta enlazada a tu perfil de Discord ha sido retirada! Por ende, tu clan ha sido eliminado!",
    };
}
