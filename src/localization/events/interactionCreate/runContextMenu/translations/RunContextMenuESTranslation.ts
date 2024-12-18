import { Translation } from "@localization/base/Translation";
import { RunContextMenuStrings } from "../RunContextMenuLocalization";

/**
 * The Spanish translation for the `runContextMenu` event utility for `interactionCreate` event.
 */
export class RunContextMenuESTranslation extends Translation<RunContextMenuStrings> {
    override readonly translations: RunContextMenuStrings = {
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
