import { Translation } from "@alice-localization/base/Translation";
import { RunCommandStrings } from "../RunCommandLocalization";

/**
 * The Spanish translation for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandESTranslation extends Translation<RunCommandStrings> {
    override readonly translations: RunCommandStrings = {
        debugModeActive:
            "Lo siento, estoy en modo de pruebas ahora. No puedo aceptar comandos de nadie, excepto dueños del bot!",
        commandNotFound:
            "Lo siento, no puedo encontrar el comando con ese nombre.",
        maintenanceMode:
            "Lo siento, me encuentro en mantenimiento con motivo de `%s`. Por favor, intenta de nuevo más tarde!",
        commandNotExecutableInChannel:
            "Lo siento, este comando no puede ser usado en este canal.",
        requiredPermissions: "Tu necesitas estos permisos: %s",
        commandInCooldown:
            "Hey, tranquilo con los comandos! Necesito descansar no?",
        commandExecutionFailed:
            "Lo siento, encontré un error al procesar el comando.",
    };
}
