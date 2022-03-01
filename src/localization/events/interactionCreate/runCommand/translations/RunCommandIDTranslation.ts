import { Translation } from "@alice-localization/base/Translation";
import { RunCommandStrings } from "../RunCommandLocalization";

/**
 * The Indonesian translation for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandIDTranslation extends Translation<RunCommandStrings> {
    override readonly translations: RunCommandStrings = {
        debugModeActive: "",
        commandNotFound: "",
        maintenanceMode: "",
        commandNotExecutableInChannel: "",
        requiredPermissions: "",
        commandInCooldown: "",
        commandExecutionFailed: "",
    };
}
