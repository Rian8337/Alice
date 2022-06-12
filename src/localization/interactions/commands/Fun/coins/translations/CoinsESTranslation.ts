import { Translation } from "@alice-localization/base/Translation";
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
            "Lo siento! No pude procesar el reclamo diario de tus monedas Alice: %s",
        dailyClaimSuccess:
            "Has reclamado %s monedas Alice! Tu racha actual es %s. Actualmente tienes %s monedas Alice.",
        dailyClaimWithStreakSuccess:
            "Has completado una racha y reclamado %s monedas Alice! Tu racha actual es %s. Ahora tienes %s monedas Alice.",
        selfCoinAmountInfo: "Tu tienes %s monedas Alice.",
        userCoinAmountInfo: "Ese usuario tiene %s monedas Alice.",
        userToTransferNotFound:
            "Lo siento! No puedo encontrar al usuario al cual quieres transferir tus monedas.",
        userToTransferIsBot: "Hey, no puedes transferir monedas a un bot!",
        userToTransferIsSelf: "Hey, no puedes transferir monedas a ti mismo!",
        transferAmountInvalid:
            "Hey, necesito un monto valido de monedas a transferir!",
        userToTransferNotInServerForAWeek:
            "Lo siento! El usuario al que quieres darle tus monedas no ha estado en el server por una semana",
        userDoesntHaveCoinsInfo:
            "Lo siento! No puedo encontrar información sobre tus monedas Alice!",
        otherUserDoesntHaveCoinsInfo:
            "Lo siento! No puedo encontrar informacion sobre las monedas Alice del usuario.",
        cannotFetchPlayerInformation:
            "Lo siento! No puedo encontrar tu perfil de osu!droid.",
        notEnoughCoinsToTransfer: "Lo siento! No tienes suficientes monedas.",
        coinTransferConfirmation:
            "¿Estas seguro de querer transferir %s monedas Alice a %s?",
        coinTransferFailed:
            "Lo siento, no puedo transferir tus monedas Alice: %s",
        coinTransferSuccess:
            "%s monedas Alice transferidas correctamente a %s. Aun puedes transferir %s monedas Alice hoy. Ahora tienes %s monedas.",
        addAmountInvalid:
            "Hey! Necesito una cantidad valida de monedas para agregar.",
        addCoinSuccess:
            "%s monedas Alice agregadas correctamente al usuario. El usuario ahora tiene %s monedas Alice.",
        addCoinFailed:
            "Lo siento, no pude agregar monedas Alice al usuario: %s.",
        removeAmountInvalid:
            "Hey! Necesito un monto valido de monedas para retirar.",
        removeCoinFailed:
            "Lo siento, no puedo retirar las monedas Alice del usuario: %s.",
        removeCoinSuccess:
            "%s monedas Alice retiradas del usuario correctamente. El usuario ahora tiene %s monedas.",
    };
}
