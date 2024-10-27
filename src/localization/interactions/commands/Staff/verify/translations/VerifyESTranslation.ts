import { Translation } from "@localization/base/Translation";
import { VerifyStrings } from "../VerifyLocalization";

/**
 * The Spanish translation for the `verify` command.
 */
export class VerifyESTranslation extends Translation<VerifyStrings> {
    override readonly translations: VerifyStrings = {
        commandNotAvailableInChannel:
            "Lo siento, este comando no puede ser usado en este canal.",
        userIsNotInThread: "Lo siento, el usuario no esta en este hilo!",
        userIsNotInVerification:
            "Lo siento, el usuario no se encuentra en proceso de verificación en estos momentos!",
        userIsAlreadyVerifiedError:
            "Lo siento, el usuario ya ha sido verificado!",
        verificationSuccess: "Usuario verificado correctamente. Cerrando hilo.",
    };
}
