import { Translation } from "@localization/base/Translation";
import { RunModalSubmitStrings } from "../RunModalSubmitLocalization";

/**
 * The English translation for the `runModalSubmit` event utility for `interactionCreate` event.
 */
export class RunModalSubmitENTranslation extends Translation<RunModalSubmitStrings> {
    override readonly translations: RunModalSubmitStrings = {
        debugModeActive:
            "I'm sorry, I'm in debug mode now. I cannot accept commands from anyone beside bot owners!",
        commandNotFound: "I'm sorry, I cannot find the command with that name.",
        maintenanceMode:
            "I'm sorry, I'm currently under maintenance due to `%s`. Please try again later!",
        commandExecutionFailed:
            "I'm sorry, I encountered an error when processing the command.",
    };
}
