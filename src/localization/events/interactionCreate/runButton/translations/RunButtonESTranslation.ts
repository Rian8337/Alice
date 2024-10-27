import { Translation } from "@localization/base/Translation";
import { RunButtonStrings } from "../RunButtonLocalization";

/**
 * The Spanish translation for the `runButton` event utility for `interactionCreate` event.
 */
export class RunButtonESTranslation extends Translation<RunButtonStrings> {
    override readonly translations: RunButtonStrings = {
        debugModeActive:
            "Lo siento, estoy en modo de pruebas ahora. No puedo aceptar comandos de nadie, excepto dueños del bot!",
        commandNotFound:
            "Lo siento, no puedo encontrar el comando con ese nombre.",
        maintenanceMode:
            "Lo siento, me encuentro en mantenimiento con motivo de `%s`. Por favor, intenta de nuevo más tarde!",
        commandInCooldown:
            "Hey, tranquilo con los comandos! Necesito descansar no?",
        commandExecutionFailed:
            "Lo siento, encontré un error al procesar el comando.",
    };
}
