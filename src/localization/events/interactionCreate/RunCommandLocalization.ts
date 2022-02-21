import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface RunCommandStrings {
    readonly debugModeActive: string;
    readonly commandNotFound: string;
    readonly maintenanceMode: string;
    readonly commandNotExecutableInChannel: string;
    readonly requiredPermissions: string;
    readonly commandInCooldown: string;
    readonly commandExecutionFailed: string;
}

/**
 * Localizations for the `runCommand` event utility for `interactionCreate` event.
 */
export class RunCommandLocalization extends Localization<RunCommandStrings> {
    protected override readonly translations: Readonly<
        Translation<RunCommandStrings>
    > = {
        en: {
            debugModeActive:
                "I'm sorry, I'm in debug mode now. I cannot accept commands from anyone beside bot owners!",
            commandNotFound:
                "I'm sorry, I cannot find the command with that name.",
            maintenanceMode:
                "I'm sorry, I'm currently under maintenance due to `%s`. Please try again later!",
            commandNotExecutableInChannel:
                "I'm sorry, this command is not executable in this channel.",
            requiredPermissions: "You need these permissions:",
            commandInCooldown:
                "Hey, calm down with the command! I need to rest too, you know.",
            commandExecutionFailed: "Unable to execute command: %s",
        },
    };
}
