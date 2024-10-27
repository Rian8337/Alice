import { Translation } from "@localization/base/Translation";
import { CoinsStrings } from "../CoinsLocalization";

/**
 * The Spanish translation for the `coins` command.
 */
export class CoinsESTranslation extends Translation<CoinsStrings> {
    override readonly translations: CoinsStrings = {
        claimNotAvailable: "",
        userNotInServerForAWeek:
            "Lo siento! No has estado en el server por una semana.",
        dailyClaimFailed:
            "Lo siento! No pude procesar el reclamo diario de tus monedas Mahiru: %s",
        dailyClaimSuccess:
            "Has reclamado %s monedas Mahiru! Tu racha actual es %s. Actualmente tienes %s monedas Mahiru.",
        dailyClaimWithStreakSuccess:
            "Has completado una racha y reclamado %s monedas Mahiru! Tu racha actual es %s. Ahora tienes %s monedas Mahiru.",
        selfCoinAmountInfo: "Tu tienes %s monedas Mahiru.",
        userCoinAmountInfo: "Ese usuario tiene %s monedas Mahiru.",
        userToTransferNotFound:
            "Lo siento! No puedo encontrar al usuario al cual quieres transferir tus monedas.",
        userToTransferIsBot: "Hey, no puedes transferir monedas a un bot!",
        userToTransferIsSelf: "Hey, no puedes transferir monedas a ti mismo!",
        transferAmountInvalid:
            "Hey, necesito un monto valido de monedas a transferir!",
        userToTransferNotInServerForAWeek:
            "Lo siento! El usuario al que quieres darle tus monedas no ha estado en el server por una semana",
        userDoesntHaveCoinsInfo:
            "Lo siento! No puedo encontrar información sobre tus monedas Mahiru!",
        otherUserDoesntHaveCoinsInfo:
            "Lo siento! No puedo encontrar informacion sobre las monedas Mahiru del usuario.",
        cannotFetchPlayerInformation:
            "Lo siento! No puedo encontrar tu perfil de osu!droid.",
        notEnoughCoinsToTransfer: "Lo siento! No tienes suficientes monedas.",
        coinTransferConfirmation:
            "¿Estas seguro de querer transferir %s monedas Mahiru a %s?",
        coinTransferFailed:
            "Lo siento, no puedo transferir tus monedas Mahiru: %s",
        coinTransferSuccess:
            "%s monedas Mahiru transferidas correctamente a %s. Aun puedes transferir %s monedas Mahiru hoy. Ahora tienes %s monedas.",
        addAmountInvalid:
            "Hey! Necesito una cantidad valida de monedas para agregar.",
        addCoinSuccess:
            "%s monedas Mahiru agregadas correctamente al usuario. El usuario ahora tiene %s monedas Mahiru.",
        addCoinFailed:
            "Lo siento, no pude agregar monedas Mahiru al usuario: %s.",
        removeAmountInvalid:
            "Hey! Necesito un monto valido de monedas para retirar.",
        removeCoinFailed:
            "Lo siento, no puedo retirar las monedas Mahiru del usuario: %s.",
        removeCoinSuccess:
            "%s monedas Mahiru retiradas del usuario correctamente. El usuario ahora tiene %s monedas.",
    };
}
