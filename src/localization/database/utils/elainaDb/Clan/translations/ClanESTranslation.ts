import { Translation } from "@alice-localization/base/Translation";
import { ClanStrings } from "../ClanLocalization";

/**
 * The Spanish translation for the `clan` command.
 */
export class ClanESTranslation extends Translation<ClanStrings> {
    override readonly translations: ClanStrings = {
        clanLeaderNotFound: "lider de clan no encontrado",
        userInCurrentClan: "usuario ya esta en el clan",
        userInAnotherClan: "usuario ya se encuentra en otro clan",
        userInCooldownForOldClan:
            "usuario aún continua en tiempo de espera para unirse a su clan anterior",
        userInCooldownForClan:
            "usuario aún continua en tiempo de espera para unirse a un clan",
        userBindedAccountNotFound:
            "cuentas enlazadas del usuario no encontradas",
        clanLeaderCannotLeaveClan: "El lider no puede salir del clan",
        userNotInClan: "el usuario no esta en el clan",
        leaderIsTheSame: "el nuevo lider es el mismo que el lider anterior",
        cannotFindNewLeader: "cannot find new leader",
        clanInMatchMode: "el clan se encuentra en combate",
        clanNotInMatchMode: "el clan ya no se encuentra en combate",
        noClanRole: "el rol de clan no existe",
        invalidImage: "imagen inválida",
        invalidImageRatio: "proporción de la imagen no es de 18:5",
        descriptionTooLong:
            "la descripción debe de tener menos de 2000 caracteres",
        clanPowerNegativeWarning: "el poder de clan podria caer bajo cero",
        clanPowerInfiniteWarning: "el poder de clan podria ser infinito",
    };
}
