import { Translation } from "@localization/base/Translation";
import { RunModalSubmitStrings } from "../RunModalSubmitLocalization";

/**
 * The Spanish translation for the `runModalSubmit` event utility for `interactionCreate` event.
 */
export class RunModalSubmitESTranslation extends Translation<RunModalSubmitStrings> {
    override readonly translations: RunModalSubmitStrings = {
        debugModeActive:
            "Lo siento, estoy en modo de pruebas ahora. No puedo aceptar comandos de nadie, excepto dueños del bot!",
        commandNotFound:
            "Lo siento, no puedo encontrar el comando con ese nombre.",
        maintenanceMode:
            "Lo siento, me encuentro en mantenimiento con motivo de `%s`. Por favor, intenta de nuevo más tarde!",
        commandExecutionFailed:
            "Lo siento, encontré un error al procesar el comando.",
    };
}
