import { Translation } from "@alice-localization/base/Translation";
import { RunContextMenuStrings } from "../RunContextMenuLocalization";

/**
 * The English translation for the `runContextMenu` event utility for `interactionCreate` event.
 */
export class RunContextMenuENTranslation extends Translation<RunContextMenuStrings> {
    override readonly translations: RunContextMenuStrings = {
        debugModeActive:
            "I'm sorry, I'm in debug mode now. I cannot accept commands from anyone beside bot owners!",
        commandNotFound: "I'm sorry, I cannot find the command with that name.",
        maintenanceMode:
            "I'm sorry, I'm currently under maintenance due to `%s`. Please try again later!",
        commandExecutionFailed: "Unable to execute command: %s",
    };
}
