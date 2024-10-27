import { Translation } from "@localization/base/Translation";
import { RunCommandStrings } from "../RunCommandLocalization";

/**
 * The English translation for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandENTranslation extends Translation<RunCommandStrings> {
    override readonly translations: RunCommandStrings = {
        debugModeActive:
            "I'm sorry, I'm in debug mode now. I cannot accept commands from anyone beside bot owners!",
        commandNotFound: "I'm sorry, I cannot find the command with that name.",
        maintenanceMode:
            "I'm sorry, I'm currently under maintenance due to `%s`. Please try again later!",
        commandNotExecutableInChannel:
            "I'm sorry, this command is not executable in this channel.",
        requiredPermissions: "You need these permissions: %s",
        commandInCooldown:
            "Hey, calm down with the command! I need to rest too, you know.",
        commandExecutionFailed:
            "I'm sorry, I encountered an error when processing the command.",
    };
}
